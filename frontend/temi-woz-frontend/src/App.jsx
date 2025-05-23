import { useEffect, useState } from "react";
import { connectWebSocket, sendMessage } from "./ws";

function App() {
  const [log, setLog] = useState([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const onWsMessage = (data) => {
      console.log('onWsMessage')
      console.log(data)
      if (data.type === 'asr_result') {
        setLog((prev) => [...prev, `Received: ${data.data}`]);
      } else if (data.type === 'suggested_response') {
        setInputText(data.data);
      }
    }
    connectWebSocket(onWsMessage);
  }, []);

  const sendCommand = (command, payload = {}) => {
    sendMessage({ command, payload });
  };

  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-dark bg-dark fixed-top">
        <span className="navbar-brand mb-0 h1">🤖 Wizard Control Dashboard</span>
      </nav>

      <div className="container-fluid main-content">
        <div className="row">
          {/* Control Panel */}
          <div className="col-md-7">
            <h4>Message Log</h4>
            <div
              className="border bg-light p-2"
              style={{ height: "400px", overflowY: "auto", fontSize: "0.9rem" }}
            >
              {log.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>

            <div className="input-group mt-2">
              <textarea
                rows={3}
                className="form-control"
                placeholder="Enter text for robot to speak..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                className="btn btn-primary"
                disabled={!inputText.trim()}
                onClick={() => {
                  if (inputText.trim() !== "") {
                    sendMessage({
                      command: "speak",
                      payload: inputText.trim()
                    });
                    setLog((prev) => [...prev, `Sent: ${inputText.trim()}`]);
                    setInputText(""); // Clear input
                  }
                }}
              >
                💬 Play on Robot
              </button>
            </div> 

          </div>

          {/* Message Log */}
          <div className="col-md-5">
            <h4>Commands</h4>
            <div className="d-grid gap-2">
              <button className="btn btn-success" onClick={() => sendCommand("move", "kitchen")}>
                🧭 Go to Kitchen
              </button>
              <button className="btn btn-warning" onClick={() => sendCommand("gesture", "wave")}>
                👋 Wave Gesture
              </button>
              <button className="btn btn-info" onClick={() => sendCommand("status_check")}>
                🩺 Check Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
