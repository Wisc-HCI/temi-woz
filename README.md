This will start out as a standalone web & websocket-server (fastAPI) & react frontend project,
where the WS acts as a bridge between the Temi robot and the frontend wizard controller.

At some point, we may integrate a variation of this websocket server into the ROS system,
and use it to create a more autonomous interaction flow.

This code is also dependent on a compatible Temi app (with WS client built-in) installed on Temi.




### Https & Certs
`vite-plugin-mkcert` is used to enable https context, so that zoom works. This has implications, since now `wss://` must be used and we need to modify backend fastAPI, too. `vite-plugin-mkcert` by default will generate the cert files in your home directory (e.g. `C:\Users\<username>\.vite-plugin-mkcert\..`).

```
rootCA.pem
rootCA-key.pem
```

```
uvicorn main:app --reload --host 0.0.0.0 --port 8000 --ssl-certfile C:\Users\xurub\.vite-plugin-mkcert/cert.pem --ssl-keyfile C:\Users\xurub\.vite-plugin-mkcert/dev.pem
```