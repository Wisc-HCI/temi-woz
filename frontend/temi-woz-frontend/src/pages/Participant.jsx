// src/pages/ParticipantPage.jsx
import React, { useEffect, useState } from 'react'
import uitoolkit from "@zoom/videosdk-ui-toolkit";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";

import { connectWebSocket, sendMessageWS } from "../utils/ws";
import { useGamepadControls } from "../utils/useGamepadControls";


const ParticipantPage = () => {

  const [showZoomUI, setShowZoomUI] = useState(false);
  const [pressedButtons, setPressedButtons] = useState([]);

  var config = {
    videoSDKJWT: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfa2V5IjoiT1lkZk5aUDhaOUNDV1AzakxoWml5cGtINXdNTnE0MVVRYnFlIiwicm9sZV90eXBlIjoxLCJ0cGMiOiJmYW1pbHktY29ubmVjdGlvbiIsImlhdCI6MTc0OTUzMjY0MSwiZXhwIjoxNzQ5NTM2MjQxfQ.a9iEtKZNBwlNaNlwqpZCF9FaTEpAWZmqAUJTl6OHx9s",
    sessionName: "family-connection",
    userName: "Parent",
    featuresOptions: [
      "video", "audio", "leave", "footer", "header"
    ]
  };

  const startVideoCall = () => {
    const sessionContainer = document.getElementById('sessionContainer');
    uitoolkit.joinSession(sessionContainer, config);
  }

  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-dark bg-dark fixed-top">
        <span className="navbar-brand mb-0 h1">🤖 Participant Dashboard</span>
      </nav>

      <div className="container-fluid main-content mt-5 pt-2">
        <div className="row">


          {/* Video Panel */}
          <div className="col-md-5">
            <h4>Video Panel</h4>
            <button
                onClick={() => {
                  startVideoCall()
                }}
                className="btn btn-primary">
              Start Video Call
            </button>
            <div id="sessionContainer" style={{ height: '70vh' }} />
          </div>


          <div className="col-md-7">

            <h4 className="mt-2">Movements</h4>
            <div className="row mt-2">
              <div className="col-sm-3">
                <button
                    className={
                      `btn w-100 ${pressedButtons.includes(14) ?
                        "btn-success" :
                        "btn-primary"}`
                    }
                    onClick={() => sendMessage({
                      command: "turnBy",
                      payload: "10"
                    })}>
                  Left
                </button>
              </div>
              <div className="col-sm-3">
                <button
                    className={
                      `btn w-100 ${pressedButtons.includes(15) ?
                        "btn-success" :
                        "btn-primary"}`
                    }
                    onClick={() => sendMessage({
                      command: "turnBy",
                      payload: "-10"
                    })}>
                  Right
                </button>
              </div>
              <div className="col-sm-3">
                <button
                    className={
                      `btn w-100 ${pressedButtons.includes(12) ?
                        "btn-success" :
                        "btn-primary"}`
                    }
                    onClick={() => sendMessage({
                      command: "skidJoy",
                      payload: "(0.5, 0)"
                    })}>
                  Forward
                </button>
              </div>
              <div className="col-sm-3">
                <button
                    className={
                      `btn w-100 ${pressedButtons.includes(13) ?
                        "btn-success" :
                        "btn-primary"}`
                    }
                    onClick={() => sendMessage({
                      command: "skidJoy",
                      payload: "(-0.5, 0)"
                    })}>
                  Back
                </button>
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-sm-3">
                <button
                    className="btn w-100 btn-primary"
                    onClick={() => sendMessage({
                      command: "tiltBy",
                      payload: "5"
                    })}>
                  Up
                </button>
              </div>
              <div className="col-sm-3">
                <button
                    className="btn w-100 btn-primary"
                    onClick={() => sendMessage({
                      command: "tiltBy",
                      payload: "-5"
                    })}>
                  Down
                </button>
              </div>
              <div className="col-sm-3">
                <button
                    className="btn w-100 btn-primary"
                    onClick={() => sendMessage({
                      command: "tiltAngle",
                      payload: "0"
                    })}>
                  👀 ahead
                </button>
              </div>
              <div className="col-sm-3">
                <button
                    className="btn w-100 btn-danger"
                    onClick={() => sendMessage({
                      command: "stopMovement",
                      payload: ""
                    })}>
                  STOP
                </button>
              </div>
            </div>  
          </div>


        </div>
      </div>


    </div>
  );
};

export default ParticipantPage;
