from models import Session, Round, ImageRecord
from typing import Dict, Optional
import uuid


sessions: Dict[str, Session] = {}


def create_session(brief: str, aspect_ratio: str = "1:1", output_mime_type: str = "image/jpeg", output_compression_quality: int = 95, seed: Optional[int] = None) -> Session:
    """Create a new session with the given brief and settings."""
    session_id = str(uuid.uuid4())
    session = Session(
        id=session_id,
        brief=brief,
        aspect_ratio=aspect_ratio,
        output_mime_type=output_mime_type,
        output_compression_quality=output_compression_quality,
        seed=seed
    )
    sessions[session_id] = session
    return session


def get_session(session_id: str) -> Optional[Session]:
    """Retrieve a session by ID."""
    return sessions.get(session_id)


def save_session(session: Session) -> None:
    """Save or update a session."""
    sessions[session.id] = session


def append_round(session_id: str, round_data: Round) -> None:
    """Append a new round to a session."""
    session = get_session(session_id)
    if session:
        session.rounds.append(round_data)
        save_session(session)
