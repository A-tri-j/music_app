TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_listening_stats",
            "description": "Get the user's actual listening time/stats for a specific month, year, or overall. Use this whenever the user asks about their listening time, hours, minutes, or how much they've listened in a specific period.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {
                        "type": "string",
                        "description": "Month name like 'August', 'January', etc. Optional.",
                    },
                    "year": {
                        "type": "integer",
                        "description": "Year like 2026. Optional.",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_artist",
            "description": "Get the user's most-listened artist based on their actual listening history.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_navigation_help",
            "description": "Get step-by-step guidance on where to find a feature in the app (e.g. profile, library, stats, search, settings). Use this when the user asks 'where is X' or 'how do I find X' about the app itself.",
            "parameters": {
                "type": "object",
                "properties": {
                    "feature": {
                        "type": "string",
                        "description": "The feature or section name the user is asking about, e.g. 'profile', 'playlist', 'stats'.",
                    },
                },
                "required": ["feature"],
            },
        },
    },
]
