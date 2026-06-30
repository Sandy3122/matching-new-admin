/**
 * Backend API base URL.
 *
 * The legacy production app is served from the Firebase project `matchingjodiweb`
 * (see functions/.firebaserc -> projects.production), i.e. https://matchingjodiweb.web.app/api.
 * The app previously pointed at `matchingjodi-backup` which is the testing/development
 * project, so every page showed a different/smaller dataset than production.
 *
 * Override per environment with a VITE_API_BASE_URL entry in a .env file, e.g.:
 *   VITE_API_BASE_URL=https://matchingjodi-backup.web.app/api   (testing)
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://matchingjodiweb.web.app/api';

/**
 * Decode a JWT and check if it is expired.
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp ? payload.exp < now : true;
  } catch (err) {
    console.warn("Failed to parse JWT token:", err);
    return true;
  }
};

/**
 * Remove authToken and redirect to login.
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('rememberMe');
  // Optionally, reload the app or redirect to login route.
  window.location.href = '/';
};

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    // Only log a warning, NO redirect!
    console.warn('No auth token found in localStorage under key "authToken".');
    return null;
  }
  // Only perform logout if token is TRULY expired
  if (isTokenExpired(token)) {
    console.warn('Auth token in localStorage is expired. Logging out and redirecting.');
    logoutUser();
    return null;
  }
  // If token is present and not expired, return it
  return token;
};
