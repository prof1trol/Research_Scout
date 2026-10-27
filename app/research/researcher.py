
from app.search.fetcher import PageFetcher
from app.llm.analyzer import ArticleAnalyzer
from app.storage.database import (
    init_db,
    get_sources_by_status,
    save_research_result,
)


def main(sources=None):
    init_db()

    fetcher = PageFetcher()
    analyzer = ArticleAnalyzer()

    if sources is None:
        sources = get_sources_by_status(status="found", limit=2)
    else:
        sources = sources[:2]

    if not sources:
        print("No sources waiting for research.")
        return

    print(f"RESEARCH: processing {len(sources)} sources")

    for index, source in enumerate(sources, start=1):
        url = source["url"]
        title = source["title"]
        snippet = source["snippet"]

        print(f"\n[{index}/{len(sources)}] {title}")
        print(url)

        page = fetcher.fetch(url)

        if page["error"]:
            print(f"Page unavailable: {page['error']}")

        page_title = page.get("title") or title
        content = page.get("content") or snippet

        if not content.strip():
            save_research_result(
                url=url,
                analysis="No page text or search snippet available.",
                status="failed",
            )
            print("Skipped: no usable text.")
            continue

        try:
            analysis = analyzer.analyze(
                title=page_title,
                content=content,
            )

            save_research_result(
                url=url,
                analysis=analysis,
                status="analyzed",
            )

            print("\n" + analysis)

        except Exception as exc:
            save_research_result(
                url=url,
                analysis=f"Analysis failed: {exc}",
                status="failed",
            )
            print(f"Analysis error: {exc}")

    print("\nResearch batch complete.")


if __name__ == "__main__":
    main()
