const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || 'request failed');
  }

  return payload;
}

export async function register(body) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export async function login(body) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
}

export async function me(token) {
  return request('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
}

export async function saveStats(token, body) {
  return request('/user/stats', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
}

export async function scanExercise(token, body) {
  return request('/ai/scan-exercise', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
}
