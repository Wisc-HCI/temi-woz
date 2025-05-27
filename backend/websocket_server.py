import asyncio
import json
from websockets.asyncio.server import serve
from fastapi import WebSocketDisconnect
import signal
from llm_model import generate_response


PATH_TEMI = '/temi'
PATH_CONTROL = '/control'
LOG_FILE = 'participant_data/log.log'
MESSAGES_FILE = 'participant_data/messages.json'


try:
    with open(MESSAGES_FILE, 'r') as f:
        MESSAGES = json.load(f)
except Exception as e:
    print('[ERROR] No messages file. Set to empty')
    MESSAGES = []


def log_event(event):
    pass



'''
photo, video
    - display 
    - capture
'''



class WebSocketServer:
    def __init__(self):
        self.connections = {
            PATH_TEMI: set(),
            PATH_CONTROL: set()
        }
        self.behavior_mode = None
        self.last_displayed = None
        self.messages = self._load_messages()


    def _load_messages(self):
        try:
            with open(MESSAGES_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            print('[ERROR] No messages file. Set to empty')
            return []

    def save_messages(self):
        with open(MESSAGES_FILE, 'w') as f:
            json.dump(self.messages, f, indent=4)

    async def handle_connection(self, websocket, ws_path):
        self.connections[ws_path].add(websocket)
        try:
            while True:
                message = await websocket.receive_text()
                print(message)
                if message == '':
                    pass
                if ws_path == PATH_TEMI:
                    await self.temi_handler(websocket, message)
                elif ws_path == PATH_CONTROL:
                    await self.control_handler(websocket, message)
                else:
                    # No handler for this path; close the connection.
                    return
        except WebSocketDisconnect:
            print(f"[{ws_path}] Disconnected")
        finally:
            if websocket in self.connections[ws_path]:
                self.connections[ws_path].remove(websocket)
            print(self.connections)

    async def send_message(self, group, message):
        # we really just expect one to be in the set
        print(f'Sending message to {group}: {message}')
        for connection in self.connections[group]:
            await connection.send_json(message)
            # try:
            #     await connection.send(json.dumps(message))
            # except Exception as e:
            #     print(e)

    async def control_handler(self, websocket, message):
        # TODO: Check if Temi wants message or msg_json
        try:
            msg_json = json.loads(message)
        except Exception as e:
            print(f'[ERROR][control_handler]: {e}')
            return
        if 'command' not in msg_json:
            return
        if msg_json['command'] == 'speak':
            self.messages.append({
                'role': 'assistant',
                'content': msg_json['payload']
            })
            self.save_messages()
            await self.send_message(PATH_TEMI, msg_json)

        elif msg_json['command'] == 'generate_response':
            img_path = None
            with_image = msg_json['payload']
            if with_image:
                # TODO
                # capture an image from Temi
                # include the path 
                # img_path = 
                pass
            res = generate_response(self.messages, img_path)
            if res:
                msg_2 = {
                    'type': 'suggested_response',
                    'data': res
                }
                await self.send_message(PATH_CONTROL, msg_2)

        elif msg_json['command'] == 'displayMedia':
            self.last_displayed = msg_json['payload']
            await self.send_message(PATH_TEMI, msg_json)

        elif msg_json['command'] == 'displayFace':
            self.last_displayed = None
            await self.send_message(PATH_TEMI, msg_json)

        elif msg_json['command'] in ['skidJoy', 'navigateCamera', 'takePicture']:
            await self.send_message(PATH_TEMI, msg_json)

        elif msg_json['command'] == 'capturePhoto':
            # TODO: behavior should differ depending on 
            # self.behavior_mode
            pass

        elif msg_json['command'] == 'startVideo':
            # TODO: behavior should differ depending on 
            # self.behavior_mode
            pass

        elif msg_json['command'] == 'stopVideo':
            # TODO:
            pass

        elif msg_json['command'] == 'changeMode':
            self.behavior_mode = msg_json['payload']
            msg = {
                'type': 'behavior_mode',
                'data': self.behavior_mode
            }
            await self.send_message(PATH_CONTROL, msg)

        elif msg_json['command'] == 'identify':
            if msg_json.get('payload') == 'wizard':
                msg = {
                    'type': 'initial_status',
                    'data': {
                        'behavior_mode': self.behavior_mode,
                        'last_displayed': self.last_displayed
                    }
                }
                await self.send_message(PATH_CONTROL, msg)

    async def temi_handler(self, websocket, message):
        try:
            msg_json = json.loads(message)
        except Exception as e:
            print(f'[ERROR][temi_handler]: {e}')
            return
        if msg_json['type'] == 'asr_result':
            self.messages.append({
                'role': 'user',
                'content': msg_json['data']
            })
            self.save_messages()
            await self.send_message(PATH_CONTROL, msg_json)
            # generate response from gpt and send to controller dashboard
            res = generate_response(self.messages)
            if res:
                msg_2 = {
                    'type': 'suggested_response',
                    'data': res
                }
                await self.send_message(PATH_CONTROL, msg_2)

    # await websocket.send(message)





# async def control_handler(websocket, message):
#     # TODO: Check if Temi wants message or msg_json
#     try:
#         msg_json = json.loads(message)
#     except Exception as e:
#         print(f'[ERROR][control_handler]: {e}')
#         return
#     if 'command' not in msg_json:
#         return
#     if msg_json['command'] == 'speak':
#         MESSAGES.append({
#             'role': 'assistant',
#             'content': msg_json['payload']
#         })
#         save_messages()
#         await send_message(PATH_TEMI, message)

#     elif msg_json['command'] == 'generate_response':
#         img_path = None
#         with_image = msg_json['payload']
#         if with_image:
#             # TODO
#             # capture an image from Temi
#             # include the path 
#             # img_path = 
#             pass
#         res = generate_response(MESSAGES, img_path)
#         if res:
#             msg_2 = {
#                 'type': 'suggested_response',
#                 'data': res
#             }
#             await send_message(PATH_CONTROL, msg_2)

#     elif msg_json['command'] == 'changeMode':
#         self.behavior_mode = msg_json['payload']
#         msg = {
#             'type': 'self.behavior_mode',
#             'data': self.behavior_mode
#         }
#         await send_message(PATH_CONTROL, msg)

#     elif msg_json['command'] == 'identify':
#         if msg_json.get('payload') == 'wizard':
#             msg = {
#                 'type': 'self.behavior_mode',
#                 'data': self.behavior_mode
#             }
#             await send_message(PATH_CONTROL, msg)









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



# async def websocket_main():
#     async with serve(handler, "", 9090):
#         await asyncio.get_running_loop().create_future()


server = WebSocketServer()

async def websocket_main():
    async def handler(websocket):
        await server.handle_connection(websocket)

    server_proc = await serve(handler, "", 9090)
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

        server_proc.close()
        await server_proc.wait_closed()
        print("✅ Server stopped cleanly")


# if __name__ == "__main__":
#     asyncio.run(websocket_main())
