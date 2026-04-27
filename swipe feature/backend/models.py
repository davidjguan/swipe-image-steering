from pydantic import BaseModel
from typing import List, Optional, Literal
import uuid
from datetime import datetime


class ImageRecord(BaseModel):
    id: str
    base64_data: str
    prompt_used: str
    direction: Optional[Literal["left", "right"]] = None

    class Config:
        json_schema_extra = {"example": {
            "id": "uuid-here",
            "base64_data": "iVBORw0KGgoAAAANS...",
            "prompt_used": "original prompt here",
            "direction": "right"
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
            "rounds": [],
            "preference_profile": {}
        }}
