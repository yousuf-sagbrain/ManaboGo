import asyncpg


async def get_all(pool: asyncpg.Pool, script_filter: str = 'both') -> list[dict]:
    # DISTINCT ON deduplicates any seed-duplicate rows, keeping one row per character.
    if script_filter == 'both':
        rows = await pool.fetch(
            """
            SELECT DISTINCT ON (script_type, character) *
            FROM kana_characters
            ORDER BY script_type, character, row_order, col_order
            """
        )
    else:
        rows = await pool.fetch(
            """
            SELECT DISTINCT ON (character) *
            FROM kana_characters
            WHERE script_type = $1
            ORDER BY character, row_order, col_order
            """,
            script_filter,
        )
    return [dict(r) for r in rows]


async def get_by_character(pool: asyncpg.Pool, character: str) -> dict | None:
    row = await pool.fetchrow(
        'SELECT * FROM kana_characters WHERE character = $1 ORDER BY id LIMIT 1',
        character,
    )
    return dict(row) if row else None


async def get_by_characters_batch(
    pool: asyncpg.Pool,
    characters: list[str],
) -> dict[str, dict]:
    """Fetch multiple kana rows in one query. Returns {character: row_dict}."""
    if not characters:
        return {}
    rows = await pool.fetch(
        """
        SELECT DISTINCT ON (character) *
        FROM kana_characters
        WHERE character = ANY($1::text[])
        ORDER BY character, id
        """,
        characters,
    )
    return {r['character']: dict(r) for r in rows}


async def get_random_subset(pool: asyncpg.Pool, script_filter: str, limit: int) -> list[dict]:
    if script_filter == 'both':
        rows = await pool.fetch(
            """
            SELECT * FROM (
                SELECT DISTINCT ON (script_type, character) *
                FROM kana_characters
                ORDER BY script_type, character, row_order, col_order
            ) deduped
            ORDER BY RANDOM() LIMIT $1
            """,
            limit,
        )
    else:
        rows = await pool.fetch(
            """
            SELECT * FROM (
                SELECT DISTINCT ON (character) *
                FROM kana_characters
                WHERE script_type = $1
                ORDER BY character, row_order, col_order
            ) deduped
            ORDER BY RANDOM() LIMIT $2
            """,
            script_filter,
            limit,
        )
    return [dict(r) for r in rows]
