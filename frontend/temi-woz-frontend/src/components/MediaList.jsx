import { useEffect, useState } from "react";

export default function MediaList({
  sendMessage,
  newMediaFile,
  displayedMedia,
  handleSendToLLM,
  temiFiles
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
                  justifyContent: "flex-start", // aligns content to the top
                  alignItems: "center",
                  height: "240px", // increase height to fit label
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Filename shown above image */}
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "6px",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={file} // show full filename on hover
                >
                  {file}
                </div>

                <div
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => setHoveredImage(file)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                {temiFiles.has(file) && (
                  <span
                    style={{
                      position: "absolute",
                      top:  4,
                      right: 4,
                      background: "#0d6efd",
                      color: "#fff",
                      padding: "2px 6px",
                      fontSize: "0.6rem",
                      borderRadius: "4px",
                      zIndex: 10
                    }}
                  >
                    Temi
                  </span>
                )} 
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
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        padding: "6px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        zIndex: 10,
                        width: "140px", // consistent button width
                      }}
                    >
                      <button
                        className="btn btn-sm btn-outline-primary w-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendToLLM(file, "conversation");
                        }}
                      >
                        Start Conversation
                      </button>

                      <button
                        className="btn btn-sm btn-outline-secondary w-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendToLLM(file, "suggestion");
                        }}
                      >
                        Provide Suggestion
                      </button>

                      <button
                        className="btn btn-sm btn-outline-success w-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToLocation(file);
                        }}
                      >
                        Go to Location
                      </button>
                    </div>
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
