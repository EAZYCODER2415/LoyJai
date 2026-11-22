from datetime import datetime
from typing import Any, Literal
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class WishContent(BaseModel):
    sender_name: str = Field(default="Anonymous", max_length=60)
    wish_text: str = Field(..., min_length=1, max_length=280)
    customization: dict[str, Any] = Field(default_factory=dict)

    @field_validator("sender_name", mode="before")
    @classmethod
    def clean_sender_name(cls, v: str | None) -> str:
        if not v or not v.strip():
            return "Anonymous"
        return v.strip()

    @field_validator("wish_text")
    @classmethod
    def clean_wish_text(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Wish text cannot be empty.")
        return cleaned


class WishCreate(WishContent):
    item_type: Literal["lantern", "krathong"]
    owner_token: str = Field(..., min_length=32, max_length=128)


class WishUpdate(WishContent):
    pass


class WishResponse(BaseModel):
    id: UUID
    item_type: Literal["lantern", "krathong"]
    sender_name: str
    wish_text: str
    customization: dict[str, Any]
    created_at: datetime


class WishStats(BaseModel):
    total: int
    lanterns: int
    krathongs: int