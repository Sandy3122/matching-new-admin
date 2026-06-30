
import { API_BASE_URL, getAuthToken } from './config';

// Login API
export const loginUser = async (phoneNumber: string, pin: string) => {
  console.log('Logging in user:', phoneNumber);
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, pin }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to login');
  }
  
  return response.json();
};

export const fetchCurrentUser = async () => {
  console.log('Fetching current user session');
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getUserDataFromSessions`, {
    cache: 'no-store',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  
  return response.json();
};
