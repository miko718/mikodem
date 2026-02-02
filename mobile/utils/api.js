// API utility with better error handling
import API_BASE_URL from '../config/API';

export async function apiFetch(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

export async function apiPost(endpoint, data) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGet(endpoint) {
  return apiFetch(endpoint, {
    method: 'GET',
  });
}
