import requests

class SearchClient:
    def __init__(self, base_url: str = "http://searxng:8080"):
        self.base_url = base_url.rstrip("/")
    def search(self, query: str, limit: int = 5) -> list[dict]:
        response = requests.get(
            f"{self.base_url}/search",
            params={
                "q": query,
                "format": "json"
            },
            timeout=15,
        )

        response.raise_for_status()
        data = response.json()

        
        from urllib.parse import urlparse

        results = []
        own_hosts = {"localhost", "127.0.0.1"}

        for result in data.get("results", []):
            url = result.get("url", "")
            host = urlparse(url).hostname

            # Пропускаем ссылки на локальный Research Scout
            if host in own_hosts:
                continue

            results.append({
                "title": result.get("title", ""),
                "url": url,
                "snippet": result.get("content", "")
            })

            if len(results) >= limit:
                break

        return results
