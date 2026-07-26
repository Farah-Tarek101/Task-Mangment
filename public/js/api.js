import { state } from './state.js';

export async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.body && { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const message = payload.error?.message || payload.message || 'Request failed';
    const details = Array.isArray(payload.error?.details)
      ? payload.error.details.map((detail) => `${detail.field}: ${detail.message}`).join(' • ')
      : '';
    throw new Error(details ? `${message} — ${details}` : message);
  }

  return payload;
}
