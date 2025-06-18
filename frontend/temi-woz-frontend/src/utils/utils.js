import html2canvas from 'html2canvas';

export async function fetchZoomToken(serverIP) {
  try {
    const response = await fetch(`http://${serverIP}/zoomJWT`);
    if (!response.ok) {
      console.error("Failed to fetch Zoom JWT:", response.statusText);
      return null;
    }

    const token = await response.text(); // If backend returns just the token string
    return token;
  } catch (error) {
    console.error("Error fetching Zoom token:", error);
    return null;
  }
}


export const getBackendUrl = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
};


export const captureAndSend = async ( sendMessage ) => {
  const canvas = await html2canvas(document.body);
  const base64Image = canvas.toDataURL('image/jpeg');
  sendMessage({
    command: "screenshot",
    payload: base64Image.split(",")[1]  // Just the base64 part, like Android does
  });
};