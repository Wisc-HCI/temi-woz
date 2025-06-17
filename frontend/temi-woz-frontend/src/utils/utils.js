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
