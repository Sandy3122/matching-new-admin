import { API_BASE_URL, getAuthToken } from './config';

/**
 * Flush the server-side Redis cache.
 * Mirrors the legacy "Hard Reset" button: POST /cache/redis/flush?force=true
 * (functions/src/routes/cacheRoutes.js).
 */
export const flushCache = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/cache/redis/flush?force=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to flush cache');
  }

  return response.json().catch(() => ({ message: 'Cache flushed' }));
};
