
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`;

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const responseText = await response.text();
  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      // Ignore non-JSON responses and fall back to the default empty object.
    }
  }

  if (!response.ok) {
    const message = data.message || data.error || responseText.trim() ||
      `Request failed (${response.status}${response.statusText ? ` ${response.statusText}` : ''}).`;
    throw new Error(message);
  }

  return data;
}

export { API_BASE_URL, apiRequest };
