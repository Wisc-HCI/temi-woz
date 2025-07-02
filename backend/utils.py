import os
import time
import jwt  # PyJWT
from functools import lru_cache
from dotenv import load_dotenv


load_dotenv()

# Get Zoom SDK credentials from environment
ZOOM_SDK_KEY = os.environ.get("ZOOM_SDK_KEY")
ZOOM_SDK_SECRET = os.environ.get("ZOOM_SDK_SECRET")
ZOOM_SESSION_NAME = os.environ.get("ZOOM_SESSION_NAME")
LOG_FILE = "participant_data/log.log"


@lru_cache(maxsize=1)
def get_zoom_jwt():
    print("get_zoom_jwt called!")
    print(ZOOM_SESSION_NAME)
    # Set JWT payload
    iat = int(time.time())
    # Token valid for 24 hours
    exp = iat + 24 * 60 * 60

    payload = {
        "app_key": ZOOM_SDK_KEY,  # SDK Key
        "iat": iat,               # Issued at
        "exp": exp,               # Expiration
        "tpc": ZOOM_SESSION_NAME,     # Unique session name (Topic)
        "role_type": 1,              # host/co-host
        "version": 1,

    }

    # Generate token
    token = jwt.encode(payload, ZOOM_SDK_SECRET, algorithm="HS256")
    print("Zoom Video SDK JWT:")
    print(token)
    return token, exp


def log_event(direction: str, path: str, data: str):
    # skip these:
    if (direction == 'received' and
        path == '/control' and
        'zoom_status' in data):
        return

    if (direction == 'sent' and
        path == '/control' and
        'zoom_status' in data and
        "'call_duration': None" in data):
        return

    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, 'a') as f:
        f.write(f"[{timestamp}][{direction}][{path}] {data}\n")