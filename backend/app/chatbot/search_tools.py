import requests
try:
    from duckduckgo_search import DDGS
except ImportError:
    try:
        from ddgs import DDGS
    except ImportError:
        DDGS = None


def web_search_music(query: str, max_results: int = 4) -> str:
    """DuckDuckGo diye recent/factual music info khuje anbe"""
    if DDGS is None:
        return "DuckDuckGo search module not installed."
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(f"{query} song", max_results=max_results))

        if not results:
            return "No web results found."

        formatted = []
        for r in results:
            formatted.append(f"- {r['title']}: {r['body']}")
        return "\n".join(formatted)
    except Exception as e:
        return f"Search failed: {str(e)}"


def musicbrainz_lookup(song_title: str, artist: str = "") -> str:
    """MusicBrainz free API diye song-er exact release year/album info anbe"""
    try:
        query = f'recording:"{song_title}"'
        if artist:
            query += f' AND artist:"{artist}"'

        res = requests.get(
            "https://musicbrainz.org/ws/2/recording",
            params={"query": query, "fmt": "json", "limit": 3},
            headers={"User-Agent": "AIMusicApp/1.0"},
            timeout=5,
        )
        data = res.json()

        if not data.get("recordings"):
            return "No MusicBrainz data found."

        formatted = []
        for rec in data["recordings"][:3]:
            title = rec.get("title", "Unknown")
            artist_name = rec.get("artist-credit", [{}])[0].get("name", "Unknown")
            releases = rec.get("releases", [])
            release_info = ""
            if releases:
                release_date = releases[0].get("date", "Unknown")
                album = releases[0].get("title", "Unknown")
                release_info = f"Album: {album}, Date: {release_date}"
            formatted.append(f"- {title} by {artist_name} ({release_info})")

        return "\n".join(formatted)
    except Exception as e:
        return f"MusicBrainz lookup failed: {str(e)}"