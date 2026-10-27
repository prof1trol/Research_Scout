import sqlite3
from pathlib import Path

import os

DATABASE_PATH = Path(
    os.getenv(
        "DATABASE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "research.db"),
    )
)

def get_connection():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row

    return connection

def init_db():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL DEFAULT '',
                snippet TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'found',
                first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_checked_at TEXT
            )
        """)

        columns = {
            row["name"]
            for row in connection.execute("PRAGMA table_info(sources)")
        }

        if "snippet" not in columns:
            connection.execute("""
                ALTER TABLE sources
                ADD COLUMN snippet TEXT NOT NULL DEFAULT ''
            """)

def source_exists(url: str) -> bool:
    with get_connection() as connection:
        result = connection.execute(
            "SELECT 1 FROM sources WHERE url = ?",
            (url,),
        ).fetchone()

    return result is not None


def save_source(
    url: str,
    title: str = "",
    snippet: str = "",
    status: str = "found",
):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT OR IGNORE INTO sources (url, title, snippet, status)
            VALUES (?, ?, ?, ?)
            """,
            (url, title, snippet, status),
        )


def update_source_status(url: str, status: str) -> bool:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE sources
            SET status = ?, last_checked_at = CURRENT_TIMESTAMP
            WHERE url = ?
            """,
            (status, url),
        )

    return cursor.rowcount > 0

def get_sources_by_status(
    status: str = "found",
    limit: int = 25,
    offset: int = 0,
):
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT url, title, snippet, status
            FROM sources
            WHERE status = ?
            ORDER BY first_seen_at DESC
            LIMIT ? OFFSET ?
            """,
            (status, limit, offset),
        ).fetchall()

    return [dict(row) for row in rows]

def get_all_sources(limit: int = 25, offset: int = 0):
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT url, title, snippet, status
            FROM sources
            ORDER BY first_seen_at DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        ).fetchall()

    return [dict(row) for row in rows]

def count_all_sources():
    with get_connection() as connection:
        result = connection.execute(
            "SELECT COUNT(*) FROM sources"
        ).fetchone()

    return result[0]


def save_research_result(url: str, analysis: str, status: str):
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE sources
            SET status = ?, last_checked_at = CURRENT_TIMESTAMP
            WHERE url = ?
            """,
            (status, url),
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS research_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL UNIQUE,
                analysis TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (url) REFERENCES sources(url)
            )
            """
        )
        connection.execute(
            """
            INSERT INTO research_results (url, analysis)
            VALUES (?, ?)
            ON CONFLICT(url) DO UPDATE SET
                analysis = excluded.analysis,
                created_at = CURRENT_TIMESTAMP
            """,
            (url, analysis),
        )

def count_sources_by_status(status: str) -> int:
    with get_connection() as connection:
        result = connection.execute(
            "SELECT COUNT(*) FROM sources WHERE status = ?",
            (status,),
        ).fetchone()
    return result[0]
