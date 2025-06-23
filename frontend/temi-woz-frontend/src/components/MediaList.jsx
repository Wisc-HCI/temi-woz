import { useEffect, useState } from "react";
import { getBackendUrl } from '../utils/utils';


export default function MediaList({ sendMessage, newMediaFile, displayedMedia }) {
  const [files, setFiles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState(null);

  const backendUrl = getBackendUrl();

  useEffect(() => {
    fetch(`${backendUrl}/api/media-list`)
      .then((res) => res.json())
      .then((data) => setFiles(data.files))
      .catch((err) => console.error("Failed to fetch media list:", err));
  }, []);

  useEffect(() => {
    if (newMediaFile && !files.includes(newMediaFile)) {
      setFiles((prev) => [newMediaFile, ...prev]);
    }
  }, [newMediaFile]);

  const handleSendToTemiClick = (filename) => {
    const confirmed = window.confirm(`Send "${filename}" to Temi for display?`);
    if (confirmed) {
      sendMessage({
        command: "displayMedia",
        payload: filename
      })
    }
  };

  const handleMediaClick = (filename) => {
    setModalMedia(filename);
    setModalOpen(true);
  }

  return (
    <div className="mt-4">
      <h3 className="font-bold">📁 Activity Streams</h3>

      {/* ✅ Scrollable wrapper */}
      <div
        className="my-3"
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          paddingRight: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        {files.length === 0 &&
          <div className="p-3">
            <h4>No media available yet. You will be notified when robot sends you new video clips!</h4>
          </div>
        }
        {files.length > 0 &&
          <div className="d-flex flex-wrap gap-4 p-3">
            {files.map((file, idx) => {
              const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file);
              const isVideo = /\.(mp4|webm)$/i.test(file);

              return (
                <div
                  key={idx}
                  style={{
                    textAlign: "center",
                    maxWidth: "200px",
                    flex: "0 0 auto",
                    cursor: "pointer",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "210px",
                    display: "flex",
                    flexDirection: "column",     
                  }}
                >
                  {isImage && (
                    <img
                      src={`${backendUrl}/media/${file}`}
                      alt={file}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        border: displayedMedia === file && "5px solid #0d6efd",
                      }}
                      onClick={() => handleMediaClick(file)}
                    />
                  )}
                  {isVideo && (
                    <video
                      src={`${backendUrl}/media/${file}`}
                      controls
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        border: displayedMedia === file && "5px solid #0d6efd",
                      }}
                      onClick={() => handleMediaClick(file)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        }
      </div>

      {modalOpen && modalMedia && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-body text-center p-0 bg-black">
                {/\.(jpg|jpeg|png|gif)$/i.test(modalMedia) ? (
                  <img
                    src={`${backendUrl}/media/${modalMedia}`}
                    alt={modalMedia}
                    className="img-fluid"
                  />
                ) : (
                  <video
                    src={`${backendUrl}/media/${modalMedia}`}
                    controls
                    className="w-100"
                  />
                )}
              </div>
              <div className="modal-footer justify-content-center">
                {sendMessage && (
                  <button className="btn btn-primary" onClick={() => {
                    handleSendToTemiClick(modalMedia)
                  }}>
                    Send to Temi
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}
