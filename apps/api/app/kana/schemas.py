from pydantic import BaseModel
from typing import Literal


class KanaCharOut(BaseModel):
    id: str
    character: str
    romaji: str
    aliases: list[str]
    script_type: Literal['hiragana', 'katakana']
    vowel_group: str | None = None
    row_order: int | None = None
    col_order: int | None = None
    audio_url: str | None = None


class ReviewAnswerIn(BaseModel):
    kana_id: str
    is_correct: bool
    response_ms: int | None = None


class ReviewAnswerOut(BaseModel):
    kana_id: str
    quality: int
    next_review_date: str
