import asyncio
import json
from websockets.asyncio.server import serve
import signal
from llm_model import generate_response


PATH_TEMI = '/temi'
PATH_CONTROL = '/control'

CONNECTIONS = {
    PATH_TEMI: set(),
    PATH_CONTROL: set()
}


LOG_FILE = 'log.log'
MESSAGES_FILE = 'messages.json'


try:
    with open(MESSAGES_FILE, 'r') as f:
        MESSAGES = json.load(f)
except Exception as e:
    print('[ERROR] No messages file. Set to empty')
    MESSAGES = []


def log_event(event):
    pass


def save_messages():
    with open(MESSAGES_FILE, 'w') as f:
        json.dump(MESSAGES, f, indent=4)



async def temi_handler(websocket, message):
    try:
        msg_json = json.loads(message)
    except Exception as e:
        print(f'[ERROR][temi_handler]: {e}')
        return
    if msg_json['type'] == 'asr_result':
        MESSAGES.append({
            'role': 'user',
            'content': msg_json['data']
        })
        save_messages()
        await send_message(PATH_CONTROL, msg_json)
        # generate response from gpt and send to controller dashboard
        res = generate_response(MESSAGES)
        if res:
            msg_2 = {
                'type': 'suggested_response',
                'data': res
            }
            await send_message(PATH_CONTROL, msg_2)

    # await websocket.send(message)





async def control_handler(websocket, message):
    # TODO: Check if Temi wants message or msg_json
    try:
        msg_json = json.loads(message)
    except Exception as e:
        print(f'[ERROR][control_handler]: {e}')
        return
    if 'command' not in msg_json:
        return
    if msg_json['command'] == 'speak':
        MESSAGES.append({
            'role': 'assistant',
            'content': msg_json['payload']
        })
        save_messages()
        await send_message(PATH_TEMI, message)

    elif msg_json['command'] == 'generate_response':
        img_path = None
        with_image = msg_json['payload']
        if with_image:
            # TODO
            # capture an image from Temi
            # include the path 
            # img_path = 
            pass
        res = generate_response(MESSAGES, img_path)
        if res:
            msg_2 = {
                'type': 'suggested_response',
                'data': res
            }
            await send_message(PATH_CONTROL, msg_2)






async def handler(websocket):
    ws_path = websocket.request.path
    try:
        async for message in websocket:
            print(message)
            if message == '':
                pass
            if ws_path == PATH_TEMI:
                CONNECTIONS[PATH_TEMI].add(websocket)
                print(CONNECTIONS)
                await temi_handler(websocket, message)
            elif ws_path == PATH_CONTROL:
                CONNECTIONS[PATH_CONTROL].add(websocket)
                print(CONNECTIONS)
                await control_handler(websocket, message)
            else:
                # No handler for this path; close the connection.
                return
    finally:
        if websocket.request.path in [PATH_TEMI, PATH_CONTROL]:
            CONNECTIONS[ws_path].remove(websocket)
        print(CONNECTIONS)

        

async def send_message(group, message):
    # we really just expect one to be in the set
    print(f'Sending message to {group}: {message}')
    for connection in CONNECTIONS[group]:
        try:
            await connection.send(json.dumps(message))
        except Exception as e:
            print(e)
            pass


import time
async def periodic():
    group = PATH_CONTROL
    while True:
        now = time.time()
        print(f'periodic: {now}')
        await send_message(group, f'periodic: {now}')
        await asyncio.sleep(2)


async def periodic_speak():
    group = PATH_CONTROL
    while True:
        now = time.time()
        print(f'periodic: {now}')
        data = {
            "command": "speak",
            "payload": "Hi Hi."
        }
        await send_message(group, data)
        await asyncio.sleep(30)


# async def test_periodic():
#     # Create a task for the repeating timer
#     task = asyncio.create_task(periodic())
#     # Let the timer run for a while
#     await asyncio.sleep(16)
#     # Cancel the task to stop the timer
#     task.cancel()


from threading import Thread



async def websocket_main():
    async with serve(handler, "", 9090):
        await asyncio.get_running_loop().create_future()


async def websocket_main():
    server = await serve(handler, "", 9090)
    print("🚀 WebSocket server running on port 9090")

    # task = asyncio.create_task(periodic_speak())

    try:
        await asyncio.Future()  # Run forever (until Ctrl+C)
    except KeyboardInterrupt:
        print("🛑 KeyboardInterrupt received, shutting down...")
    finally:
        # task.cancel()  # cancel background task
        # try:
        #     await task
        # except asyncio.CancelledError:
        #     print("✅ periodic_speak cancelled")

        server.close()
        await server.wait_closed()
        print("✅ Server stopped cleanly")


if __name__ == "__main__":
    asyncio.run(websocket_main())
