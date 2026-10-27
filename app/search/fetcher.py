
import requests
from bs4 import BeautifulSoup


class PageFetcher:
    def fetch(self, url: str) -> dict:
        try:
            response = requests.get(
                url,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (compatible; ResearchScout/0.1)"
                    )
                },
                timeout=15,
            )

            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")

            for element in soup.select(
                "script, style, nav, footer, header, aside"
            ):
                element.decompose()

            title = soup.title.get_text(" ", strip=True) if soup.title else ""

            content = soup.get_text(" ", strip=True)

            return {
                "url": url,
                "title": title,
                "content": content[:15000],
                "error": None,
            }

        except requests.RequestException as exc:
            return {
                "url": url,
                "title": "",
                "content": "",
                "error": str(exc),
            }
