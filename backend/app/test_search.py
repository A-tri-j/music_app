from app.chatbot.search_tools import web_search_music, musicbrainz_lookup

print("--- Web Search Test ---")
print(web_search_music("2026 hit song"))

print("\n--- MusicBrainz Test ---")
print(musicbrainz_lookup("Tumhi Ho"))