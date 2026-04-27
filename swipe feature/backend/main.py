import os
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import uuid

from models import Session, Round, ImageRecord
import session_store
from imagen_client import generate_images
from gpt_client import summarize_preferences
from prompt_engine import build_image_prompt

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not GEMINI_API_KEY or not OPENAI_API_KEY:
    raise ValueError("Missing required environment variables: GEMINI_API_KEY and OPENAI_API_KEY")

# Initialize FastAPI app
app = FastAPI(title="Swipe Image Steering")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class StartSessionRequest(BaseModel):
    brief: str


class StartSessionResponse(BaseModel):
    session_id: str
    round: Round


class SwipeRequest(BaseModel):
    session_id: str
    image_id: str
    direction: Literal["left", "right"]


class SwipeResponse(BaseModel):
    success: bool
    swipes_recorded: int


class NextRoundRequest(BaseModel):
    session_id: str


class NextRoundResponse(BaseModel):
    round: Round
    preference_profile: dict
    summary_card: dict


class HistoryResponse(BaseModel):
    session_id: str
    brief: str
    rounds: list


# Endpoints

@app.post("/session/start", response_model=StartSessionResponse)
async def start_session(req: StartSessionRequest):
    """Start a new session and generate the first batch of images."""
    try:
        print(f"[START_SESSION] Received brief: {req.brief[:50]}...")
        
        # Create session
        session = session_store.create_session(req.brief)
        print(f"[START_SESSION] Created session: {session.id}")
        
        # Build initial prompt
        prompt = build_image_prompt(req.brief, {})
        print(f"[START_SESSION] Prompt: {prompt}")
        
        # Generate 4 images in parallel
        print("[START_SESSION] Calling generate_images...")
        base64_images = await generate_images(prompt, count=4)
        print(f"[START_SESSION] Generated {len(base64_images)} images")
        
        if not base64_images or len(base64_images) < 4:
            raise HTTPException(status_code=500, detail="Could not generate all 4 images")
        
        # Create image records
        image_records = [
            ImageRecord(
                id=str(uuid.uuid4()),
                base64_data=img,
                prompt_used=prompt
            )
            for img in base64_images
        ]
        
        # Create Round 0
        round_0 = Round(
            round_number=0,
            images=image_records
        )
        
        # Store round
        session.rounds.append(round_0)
        session_store.save_session(session)
        
        print(f"[START_SESSION] Session ready with {len(image_records)} images")
        
        return StartSessionResponse(
            session_id=session.id,
            round=round_0
        )
    
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"[START_SESSION] ERROR: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/session/swipe", response_model=SwipeResponse)
async def record_swipe(req: SwipeRequest):
    """Record a swipe (like/dislike) for an image."""
    try:
        session = session_store.get_session(req.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Find the image in the current round
        if not session.rounds:
            raise HTTPException(status_code=400, detail="No rounds in session")
        
        current_round = session.rounds[-1]
        image_found = False
        
        for img in current_round.images:
            if img.id == req.image_id:
                img.direction = req.direction
                image_found = True
                break
        
        if not image_found:
            raise HTTPException(status_code=404, detail="Image not found in current round")
        
        session_store.save_session(session)
        
        # Count how many images have been swiped
        swipes_recorded = sum(1 for img in current_round.images if img.direction is not None)
        
        return SwipeResponse(
            success=True,
            swipes_recorded=swipes_recorded
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in record_swipe: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/session/next", response_model=NextRoundResponse)
async def next_round(req: NextRoundRequest):
    """Generate the next round of images based on feedback."""
    try:
        print(f"[NEXT_ROUND] Starting for session: {req.session_id}")
        session = session_store.get_session(req.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if not session.rounds:
            raise HTTPException(status_code=400, detail="No rounds in session")
        
        current_round = session.rounds[-1]
        
        # Check if all images have been swiped
        if not all(img.direction is not None for img in current_round.images):
            raise HTTPException(status_code=400, detail="Not all images have been swiped")
        
        # Call GPT to analyze preferences
        print(f"[NEXT_ROUND] Calling GPT to analyze preferences...")
        preference_data = summarize_preferences(session, OPENAI_API_KEY)
        print(f"[NEXT_ROUND] GPT response: {preference_data}")
        
        # Update current round with GPT analysis
        current_round.gpt_summary = preference_data.get("summary")
        current_round.liked_attributes = preference_data.get("liked_attributes", [])
        current_round.disliked_attributes = preference_data.get("disliked_attributes", [])
        current_round.next_prompt_modifier = preference_data.get("next_prompt_modifier")
        
        print(f"[NEXT_ROUND] Liked: {current_round.liked_attributes}, Disliked: {current_round.disliked_attributes}")
        
        # Update session preference profile
        session.preference_profile = preference_data
        
        # Build next prompt
        next_prompt = build_image_prompt(session.brief, session.preference_profile)
        print(f"[NEXT_ROUND] Next prompt: {next_prompt[:100]}...")
        
        # Generate next batch of images
        print(f"[NEXT_ROUND] Generating next batch...")
        base64_images = await generate_images(next_prompt, count=4)
        
        if not base64_images or len(base64_images) < 4:
            raise HTTPException(status_code=500, detail="Could not generate all 4 images")
        
        # Create image records for next round
        next_image_records = [
            ImageRecord(
                id=str(uuid.uuid4()),
                base64_data=img,
                prompt_used=next_prompt
            )
            for img in base64_images
        ]
        
        # Create new round
        next_round_num = len(session.rounds)
        new_round = Round(
            round_number=next_round_num,
            images=next_image_records
        )
        
        # Append new round to session
        session.rounds.append(new_round)
        session_store.save_session(session)
        
        print(f"[NEXT_ROUND] Created new round {next_round_num} with {len(next_image_records)} images")
        
        return NextRoundResponse(
            round=new_round,
            preference_profile=session.preference_profile,
            summary_card={
                "summary": preference_data.get("summary"),
                "liked_attributes": preference_data.get("liked_attributes", []),
                "disliked_attributes": preference_data.get("disliked_attributes", [])
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[NEXT_ROUND] Error: {e}")
        print(f"[NEXT_ROUND] Traceback:\n{error_trace}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/session/{session_id}/history", response_model=HistoryResponse)
async def get_history(session_id: str):
    """Get the full history of a session."""
    try:
        session = session_store.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return HistoryResponse(
            session_id=session.id,
            brief=session.brief,
            rounds=session.rounds
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
