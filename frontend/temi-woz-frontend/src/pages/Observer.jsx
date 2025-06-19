// src/pages/ParticipantPage.jsx
import React, { useEffect, useState } from 'react'
import uitoolkit from "@zoom/videosdk-ui-toolkit";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import ZoomVideo from '@zoom/videosdk'

import { connectWebSocket, sendMessageWS } from "../utils/ws";
import { fetchZoomToken } from "../utils/utils"; 


// TODO: periodic fetch current Zoom status and display


const ObserverPage = () => {

  const [showZoomUI, setShowZoomUI] = useState(false);
  const [videoCallStatus, setVideoCallStatus] = useState(null);
  const [zoomStream, setZoomStream] = useState(null);
  const [zoomStatus, setZoomStatus] = useState(null);

  var client = ZoomVideo.createClient()

  useEffect(() => {
    console.log(zoomStream)
  }, [zoomStream]);


  const sendMessage = (message) => {
    sendMessageWS(message);
  };

  function useZoomStatusPoller(sendMessage, intervalMs = 2500) {
    useEffect(() => {
      const intervalId = setInterval(() => {
        sendMessage({ command: "zoom_status" });
      }, intervalMs);

      return () => clearInterval(intervalId); // Cleanup on unmount
    }, [sendMessage, intervalMs]);
  }

  // poll zoom call status
  useZoomStatusPoller(sendMessage);

  function formatDuration(seconds) {
    if (seconds > 10000) {
      return 'error'
    }
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secondsLeft = totalSeconds % 60;
    return `${minutes}m ${secondsLeft}s`;
  }


  useEffect(() => {
    const onWsMessage = (data) => {
      console.log('onWsMessage')
      console.log(data)
      if (data.type === "media_uploaded") {
        const msg = `✅ Media uploaded: ${data.filename}`;
        // setUploadNotification(msg);
        // setLatestUploadedFile(data.filename); 
        // setTimeout(() => setUploadNotification(null), 3000);
      } else if (data.type === "video_call") {
        if (data.data === 'start')
        setVideoCallStatus('ringing');
      } else if (data.type === "zoom_status") {
        setZoomStatus(data.data)
      }
    }
    // share the path of the main control page
    connectWebSocket(onWsMessage, "control");
  }, []);


  // console.log(import.meta.env.VITE_ZOOM_JWT)

  var config = {
    videoSDKJWT: import.meta.env.VITE_ZOOM_JWT,
    sessionName: "research-study",
    userName: "Researcher",
    featuresOptions: {
      'feedback': {
        enable: false
      },
      'leave': {
        enable: true
      },
      'video': {
        enable: false
      },
      'chat': {
        enable: false,
      },
      'share': {
        enable: false,
      },
      'subsession': {
        enable: false,
      },

    }
  };


  const startVideoCall = async () => {
    setShowZoomUI(true)
    const sessionContainer = document.getElementById('sessionContainer');
    var token = await fetchZoomToken(import.meta.env.VITE_SERVER_IP);
    if (token === null) {
      token = import.meta.env.VITE_ZOOM_JWT
    }
    config['videoSDKJWT'] = token

    uitoolkit.joinSession(sessionContainer, config);
    const sessionDestroyed = () => {
      console.log("sessionDestroyed")
      uitoolkit.destroy();
      setShowZoomUI(false)
    }
    uitoolkit.onSessionDestroyed(sessionDestroyed);
  }

  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-dark bg-dark fixed-top">
        <span className="navbar-brand mb-0 h1">🤖 Observer Dashboard</span>
      </nav>

      <div className="container-fluid main-content mt-5 pt-2">

        {!showZoomUI &&
          <button
              onClick={() => {
                startVideoCall()
              }}
              className="btn btn-primary">
            Start Video Call
          </button>
        }

        
          <div
            style={{
              display: showZoomUI ? 'block' : 'none'
            }}>
            <div className="row">
              {/* Video Panel */}
              <div className="col-md-12">
                <h4>Video Panel</h4>
                <div
                  id="sessionContainer"
                  style={{
                    height: '70vh',
                  }}
                ></div>
                  <button
                    onClick={() => {
                      setShowZoomUI(false);
                    }}
                    className="btn btn-primary">
                  Hide
                </button>
              </div>
            </div>

          </div>

          {zoomStatus &&
            <div>
              <h3>Zoom Call Status</h3>
              <p><strong>Robot:</strong> {zoomStatus.robot || 'N/A'}</p>
              <p><strong>Participant:</strong> {zoomStatus.participant || 'N/A'}</p>
              <p>
                <strong>Call Duration:</strong> {formatDuration(zoomStatus.call_duration)}
              </p>
            </div>
          }

          <div className="row">
            <div className="col-md-12">

              <h4 className="mt-2">Controls</h4>
              <div className="row mt-2">
                <div className="col-sm-3">
                  <button
                      className="btn w-100 btn-primary"
                      onClick={() => {
                        setZoomStream(client.getMediaStream());
                      }}>
                    Get Stream
                  </button>
                </div>
                <div className="col-sm-3">
                  <button
                      className="btn w-100 btn-primary"
                      onClick={() => {
                        zoomStream.muteAudio()
                      }}>
                    Mute Audio
                  </button>
                </div>
                <div className="col-sm-3">
                  <button
                      className="btn w-100 btn-primary"
                      onClick={() => sendMessage({
                        command: "video_call",
                        payload: "proactive_call"
                      })}>
                    Call All
                  </button>
                </div>
                <div className="col-sm-3">
                  <button
                      className="btn w-100 btn-primary"
                      onClick={() => sendMessage({
                        command: "video_call",
                        payload: "end"
                      })}>
                    End All
                  </button>
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-sm-3">
                  <button
                      className="btn w-100 btn-primary"
                      onClick={() => sendMessage({
                        command: "video_call",
                        payload: "ending_alert"
                      })}>
                    Announce Ending
                  </button>
                </div>
                {/*<div className="col-sm-3">
                  <button
                      className="btn w-100 btn-primary"
                      onClick={() => sendMessage({
                        command: "zoom_status"
                      })}>
                    Call Status
                  </button>
                </div>*/}
              </div>


            </div>
          </div>


      </div>
    </div>
  );
};

export default ObserverPage;
