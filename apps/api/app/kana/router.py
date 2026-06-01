from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from asyncpg import Pool

from app.auth.dependencies import get_current_user
from app.database import get_pool
from . import queries, srs
from .schemas import KanaCharOut, ReviewAnswerIn, ReviewAnswerOut

router = APIRouter(prefix='/kana', tags=['kana'])


@router.get('/characters', response_model=list[KanaCharOut])
async def list_characters(
    script: Literal['hiragana', 'katakana', 'both'] = 'both',
    pool: Pool = Depends(get_pool),
):
    return await queries.get_all(pool, script)


@router.get('/queue', response_model=list[KanaCharOut])
async def get_srs_queue(
    script: Literal['hiragana', 'katakana', 'both'] = 'both',
    current_user: dict = Depends(get_current_user),
    pool: Pool = Depends(get_pool),
):
    return await srs.get_due_queue(pool, str(current_user['id']), script)


@router.post('/review', response_model=ReviewAnswerOut)
async def submit_review(
    body: ReviewAnswerIn,
    current_user: dict = Depends(get_current_user),
    pool: Pool = Depends(get_pool),
):
    quality = srs.quality_from_answer(body.is_correct, body.response_ms)
    await srs.record_review(pool, str(current_user['id']), body.kana_id, quality)

    row = await pool.fetchrow(
        'SELECT next_review_date FROM kana_srs_schedule WHERE user_id = $1 AND kana_id = $2',
        str(current_user['id']),
        body.kana_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail='Schedule record not found')

    return ReviewAnswerOut(
        kana_id=body.kana_id,
        quality=quality,
        next_review_date=str(row['next_review_date']),
    )
