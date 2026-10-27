from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal
from app.storage.database import (
    init_db,
    get_sources_by_status,
    get_all_sources,
    count_all_sources,
    update_source_status,
    count_sources_by_status
)
from app.search.search import SearchClient
from app.storage.database import save_source, source_exists
import requests
from app.search.queries import ( 
    queries_it,
    queries_politics,
    queries_underdog,
    queries_activists,
    queries_pets,
    queries_wildlife,
    queries_history,
    queries_geopolitics,
    queries_gaming,
)
from app.main import execute_search

app = FastAPI(title="Research Scout API")
search_client = SearchClient(base_url="http://searxng:8080")


class SearchRequest(BaseModel):
    choice: str
    limit: int = 5


@app.post("/api/search")
def run_search(payload: SearchRequest):
    choice = payload.choice.strip()

    if not choice:
        raise HTTPException(
            status_code=400,
            detail="Search choice cannot be empty",
        )

    try:
        result = execute_search(
            choice=choice,
            limit=payload.limit,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Search service error: {exc}",
        )
    return result

class StatusUpdate(BaseModel):
    url: str
    status: Literal["found", "analyzed", "failed", "Saved", "Researching", "Rejected"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/")
def root():
    return {"message": "Research Scout API is running"}

@app.get("/api/sources")
def list_sources(
    status: str = "found",
    limit: int = 25,
    offset: int = 0,
):
    if status == "all":
        sources = get_all_sources(limit=limit, offset=offset)
        total = count_all_sources()
    else:
        sources = get_sources_by_status(status=status, limit=limit, offset=offset)
        total = count_sources_by_status(status)

    return {
        "count": len(sources),
        "total": total,
        "sources": sources,
        "limit": limit,
        "offset": offset,
    }


@app.patch("/api/sources/status")
def change_source_status(payload: StatusUpdate):
    from app.storage.database import get_connection

    with get_connection() as connection:
        row = connection.execute(
            "SELECT url, status FROM sources WHERE url = ?",
            (payload.url,),
        ).fetchone()

    print("PATCH URL:", repr(payload.url))
    print("DATABASE ROW:", dict(row) if row else None)

    updated = update_source_status(payload.url, payload.status)
    print("UPDATED:", updated)

    if not updated:
        raise HTTPException(status_code=404, detail="Source not found")

    return {
        "message": "Status updated",
        "url": payload.url,
        "status": payload.status,
    }
