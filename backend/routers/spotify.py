import os
import urllib.parse
import requests
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List

router = APIRouter(prefix="/api/spotify", tags=["Spotify Web Playback & OAuth 2.0"])

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:3000/api/spotify/callback")

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

SCOPES = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state"
]

@router.get("/auth-url")
def get_auth_url() -> Dict[str, str]:
    """
    Generates the Spotify OAuth 2.0 authorization URL for Web Playback SDK integration.
    """
    if not SPOTIFY_CLIENT_ID:
        return {
            "configured": False,
            "url": "",
            "message": "SPOTIFY_CLIENT_ID is not configured in .env. Falling back to embedded study player."
        }

    params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "state": "study_nexus_auth"
    }
    url = f"{SPOTIFY_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return {
        "configured": True,
        "url": url,
        "message": "Spotify OAuth 2.0 ready"
    }


@router.post("/token")
def exchange_token(code: str = Query(...)) -> Dict[str, Any]:
    """
    Exchanges the authorization code for an access token and refresh token.
    """
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail="Spotify API credentials are missing.")

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    res = requests.post(SPOTIFY_TOKEN_URL, data=payload, headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    return res.json()


@router.get("/curated-playlists")
def get_curated_playlists() -> List[Dict[str, Any]]:
    """
    Returns curated focus playlists pre-optimized for deep cognitive work.
    """
    return [
        {
            "id": "playlist-lofi-nexus",
            "name": "Lofi Cyber Nexus [A+ Focus]",
            "category": "lofi",
            "spotifyUri": "spotify:playlist:37i9dQZF1DX8Uebhn9wzrS",
            "embedUrl": "https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0",
            "bpm": "80 BPM",
            "recommendedFor": "Active coding & reading comprehension"
        },
        {
            "id": "playlist-synth-dark",
            "name": "Obsidian Synthwave Deep-Work",
            "category": "synthwave",
            "spotifyUri": "spotify:playlist:37i9dQZF1DXdLEN7aqioXM",
            "embedUrl": "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0",
            "bpm": "115 BPM",
            "recommendedFor": "Timed problem sets and algorithm crunch"
        },
        {
            "id": "playlist-binaural-alpha",
            "name": "Binaural 10Hz Alpha Brainwaves",
            "category": "binaural",
            "spotifyUri": "spotify:playlist:37i9dQZF1DX9uKNf5jGX6m",
            "embedUrl": "https://open.spotify.com/embed/playlist/37i9dQZF1DX9uKNf5jGX6m?utm_source=generator&theme=0",
            "bpm": "Frequency Tone",
            "recommendedFor": "Memorizing molecular pathways & quantum proofs"
        },
        {
            "id": "playlist-classical-mozart",
            "name": "High-Velocity Classical Intellect",
            "category": "classical",
            "spotifyUri": "spotify:playlist:37i9dQZF1DWZeKCadgRdKQ",
            "embedUrl": "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0",
            "bpm": "Dynamic Classical",
            "recommendedFor": "Mathematical derivations & logic reasoning"
        }
    ]
