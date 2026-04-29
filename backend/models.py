from pydantic import BaseModel
from typing import List, Optional, Literal
import uuid
from datetime import datetime


class ImageRecord(BaseModel):
    id: str
    base64_data: str
    prompt_used: str
    direction: Optional[Literal["left", "right"]] = None
    liked_feedback: Optional[str] = None
    disliked_feedback: Optional[str] = None

    class Config:
        json_schema_extra = {"example": {
            "id": "uuid-here",
            "base64_data": "iVBORw0KGgoAAAANS...",
            "prompt_used": "original prompt here",
            "direction": "right",
            "liked_feedback": "Love the colors and composition",
            "disliked_feedback": None
        }}


class Round(BaseModel):
    round_number: int
    images: List[ImageRecord]
    gpt_summary: Optional[str] = None
    liked_attributes: List[str] = []
    disliked_attributes: List[str] = []
    next_prompt_modifier: Optional[str] = None

    class Config:
        json_schema_extra = {"example": {
            "round_number": 0,
            "images": [],
            "gpt_summary": None,
            "liked_attributes": [],
            "disliked_attributes": [],
            "next_prompt_modifier": None
        }}


class Session(BaseModel):
    id: str
    brief: str
    aspect_ratio: Optional[str] = "1:1"
    output_mime_type: Optional[str] = "image/jpeg"
    output_compression_quality: Optional[int] = 95
    seed: Optional[int] = None
    rounds: List[Round] = []
    preference_profile: dict = {}
    created_at: datetime = None

    def __init__(self, **data):
        if 'created_at' not in data:
            data['created_at'] = datetime.now()
        super().__init__(**data)

    class Config:
        json_schema_extra = {"example": {
            "id": "uuid-here",
            "brief": "A serene mountain landscape at sunset",
            "aspect_ratio": "1:1",
            "output_mime_type": "image/jpeg",
            "output_compression_quality": 95,
            "seed": None,
            "rounds": [],
            "preference_profile": {}
        }}
