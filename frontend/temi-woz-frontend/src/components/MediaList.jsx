import { useEffect, useState } from "react";

export default function MediaList({
  sendMessage,
  newMediaFile,
  displayedMedia,
  handleSendToLLM,
}) {
  const [files, setFiles] = useState([]);
  const [hoveredImage, setHoveredImage] = useState(null);
  const goToLocation = async (filename) => {
    const properName = filename.toLowerCase();
    console.log("Sending goTo for:", properName);
    sendMessage({
      command: "goTo",
      payload: properName,
    });
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/media-list")
      .then((res) => res.json())
      .then((data) => setFiles(data.files || []))
      .catch((err) => console.error("Failed to fetch media list:", err));
  }, []);

  useEffect(() => {
    if (newMediaFile && !files.includes(newMediaFile)) {
      setFiles((prev) => [newMediaFile, ...prev]);
    }
  }, [newMediaFile]);

  const handleClickWithConfirm = (filename) => {
    const confirmed = window.confirm(`Send "${filename}" to Temi for display?`);
    if (confirmed) {
      sendMessage({
        command: "displayMedia",
        payload: filename,
      });
    }
  };

  return (
    <div className="mt-4">
      <h4>📁 Uploaded Media</h4>

      {/* ✅ Scrollable wrapper */}
      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          paddingRight: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <div className="d-flex flex-wrap gap-4 p-3">
          {files.map((file, idx) => {
            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file);
            const isVideo = /\.(mp4|webm)$/i.test(file);
            const mediaUrl = `http://localhost:8000/media/${file}`;

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
                <div
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => setHoveredImage(file)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  {isImage && (
                    <img
                      src={mediaUrl}
                      alt={file}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        border: displayedMedia === file && "5px solid #0d6efd",
                      }}
                      onClick={() => handleClickWithConfirm(file)}
                    />
                  )}

                  {isVideo && (
                    <video
                      src={mediaUrl}
                      controls
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        border: displayedMedia === file && "5px solid #0d6efd",
                      }}
                      onClick={() => handleClickWithConfirm(file)}
                    />
                  )}

                  {hoveredImage === file && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendToLLM(file, isVideo ? "video" : "image");
                        }}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Send to LLM
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToLocation(file);
                        }}
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          right: "8px",
                          backgroundColor: "#0d6efd",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Go to Location
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
