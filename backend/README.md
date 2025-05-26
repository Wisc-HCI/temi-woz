```
# Python 3.12.8
python -m venv env

# (windows)
./env/Scripts/activate

pip install -r requirements.txt
```


```
FAMILY_INFO_STR=""
OPENAI_API_KEY="sk-W9...g13Tm1h"
```


```
Temi App
 ├── WebSocket -> control server (text commands, state updates)
 └── HTTP GET/POST -> media server (photo/video uploads/display)

Media Server (e.g. FastAPI)
 ├── POST /upload
 └── GET  /view/<filename>

WebSocket Server
 ├── Handles commands and chat
 └── Not burdened by large media transfers

```