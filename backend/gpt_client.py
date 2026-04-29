import json
from typing import Dict, List
from openai import OpenAI
from models import Session, ImageRecord
import base64


def summarize_preferences(session: Session, openai_api_key: str) -> Dict:
    """
    Use GPT-4o to analyze liked vs disliked images and extract preference patterns.
    Returns a dict with: summary, liked_attributes, disliked_attributes, next_prompt_modifier.
    """
    client = OpenAI(api_key=openai_api_key)
    
    # Only analyze the MOST RECENT round to avoid token limits
    if not session.rounds:
        return {
            "summary": "No images to analyze yet",
            "liked_attributes": [],
            "disliked_attributes": [],
            "next_prompt_modifier": ""
        }
    
    current_round = session.rounds[-1]
    
    # Collect images organized by swipe direction from CURRENT ROUND ONLY
    liked_images: List[ImageRecord] = []
    disliked_images: List[ImageRecord] = []
    
    for img in current_round.images:
        if img.direction == "right":
            liked_images.append(img)
        elif img.direction == "left":
            disliked_images.append(img)
    
    # If no swipes yet, return empty
    if not liked_images and not disliked_images:
        return {
            "summary": "Waiting for swipes to analyze preferences",
            "liked_attributes": [],
            "disliked_attributes": [],
            "next_prompt_modifier": ""
        }
    
    # Build message content with images
    message_content = []
    
    # Collect user feedback text
    feedback_text = ""
    for img in current_round.images:
        if img.direction == "right" and (img.liked_feedback or img.disliked_feedback):
            feedback_text += f"\nLiked Image Feedback: {img.liked_feedback or 'No specific feedback'}"
            if img.disliked_feedback:
                feedback_text += f" (Also noted: {img.disliked_feedback})"
        elif img.direction == "left" and (img.liked_feedback or img.disliked_feedback):
            feedback_text += f"\nDisliked Image Feedback: {img.disliked_feedback or 'No specific feedback'}"
            if img.liked_feedback:
                feedback_text += f" (Also noted: {img.liked_feedback})"
    
    # Add text context
    brief_text = f"""Original Brief: {session.brief}

Current Preference Profile: {json.dumps(session.preference_profile, indent=2)}

I'm analyzing your swiping patterns to understand your visual preferences. Below are the images you liked (swiped right) and disliked (swiped left) from Round {current_round.round_number}.

{f'USER FEEDBACK:{feedback_text}' if feedback_text else ''}

Focus on VISUAL ATTRIBUTES: color palette, lighting, composition, texture, mood, subject matter, style, etc.
When analyzing, consider both the visual patterns you see in the images AND any specific feedback the user provided about what they liked or disliked."""
    message_content.append({"type": "text", "text": brief_text})
    
    # Add liked images with label
    if liked_images:
        message_content.append({
            "type": "text",
            "text": f"\n=== LIKED IMAGES ({len(liked_images)}) ==="
        })
        for img in liked_images[:2]:  # Limit to 2 liked images to save tokens
            message_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{img.base64_data}"}
            })
        if len(liked_images) > 2:
            message_content.append({
                "type": "text",
                "text": f"(+{len(liked_images) - 2} more liked images)"
            })
    
    # Add disliked images with label
    if disliked_images:
        message_content.append({
            "type": "text",
            "text": f"\n=== DISLIKED IMAGES ({len(disliked_images)}) ==="
        })
        for img in disliked_images[:2]:  # Limit to 2 disliked images to save tokens
            message_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{img.base64_data}"}
            })
        if len(disliked_images) > 2:
            message_content.append({
                "type": "text",
                "text": f"(+{len(disliked_images) - 2} more disliked images)"
            })
    
    # Final instruction
    message_content.append({
        "type": "text",
        "text": "\nAnalyze these images and respond ONLY in the exact JSON format specified. Be specific about visual attributes."
    })
    
    system_prompt = """You are a visual preference analyst helping steer AI image generation.
The user is swiping right (like) or left (dislike) on generated images to guide the system toward their ideal result.

Analyze the pattern of liked vs disliked images directly from what you see in them. Identify which visual attributes — such as color palette, lighting, composition, texture, mood, and subject style — are driving the user's preferences.

PAY SPECIAL ATTENTION to any user feedback text provided - this contains explicit statements about what they liked or disliked about specific images. Use this feedback to understand their preferences more precisely.

Handle contradictions carefully. If the user liked a warm image in one round but disliked one in another, look for the more specific attribute that actually differs.

Respond ONLY in this exact JSON format with no extra text or markdown:
{
  "summary": "A plain English explanation of what the user seems to prefer",
  "liked_attributes": ["attribute1", "attribute2"],
  "disliked_attributes": ["attribute1", "attribute2"],
  "next_prompt_modifier": "A short descriptive phrase to append to the next image generation prompt"
}"""
    
    try:
        print(f"[GPT] Creating chat completion...")
        response = client.chat.completions.create(
            model="gpt-4o",
            max_tokens=1024,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": message_content
                }
            ]
        )
        
        response_text = response.choices[0].message.content
        print(f"[GPT] Raw response: {response_text}")
        
        # Try to parse JSON defensively
        try:
            result = json.loads(response_text)
            print(f"[GPT] Successfully parsed preferences: {result}")
            return result
        except json.JSONDecodeError as e:
            print(f"[GPT] JSON parse error: {e}")
            # Try stripping markdown fences
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            try:
                result = json.loads(response_text)
                print(f"[GPT] Successfully parsed after markdown stripping: {result}")
                return result
            except json.JSONDecodeError as e2:
                print(f"[GPT] Still failed to parse after stripping: {e2}")
                # Fallback
                return {
                    "summary": "Could not parse preferences. Please continue swiping.",
                    "liked_attributes": [],
                    "disliked_attributes": [],
                    "next_prompt_modifier": ""
                }
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[GPT] Error calling GPT-4o: {e}")
        print(f"[GPT] Full traceback:\n{error_trace}")
        return {
            "summary": f"Error analyzing preferences: {str(e)}",
            "liked_attributes": [],
            "disliked_attributes": [],
            "next_prompt_modifier": ""
        }
