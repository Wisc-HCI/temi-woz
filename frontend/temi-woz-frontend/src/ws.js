let socket;

export function connectWebSocket(onMessage) {
  socket = new WebSocket("ws://localhost:9090/control");

  socket.onopen = () => {
    console.log("WebSocket connected");
    socket.send(JSON.stringify({ type: "identify", role: "wizard" }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received2:", data);
    onMessage?.(data);
  };

  socket.onclose = () => {
    console.warn("WebSocket closed");
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

export function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.warn("WebSocket not open");
  }
}
