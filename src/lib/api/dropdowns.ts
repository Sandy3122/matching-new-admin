
import { API_BASE_URL, getAuthToken } from './config';

export const fetchDropdowns = async () => {
  console.log('Fetching all dropdowns');
  const token = getAuthToken();
  if (!token) {
    throw new Error('Auth token missing - are you logged in?');
  }
  console.log('Using token:', token);
  const response = await fetch(`${API_BASE_URL}/dropdowns`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.error("Dropdowns API returned status:", response.status, await response.text());
    throw new Error('Failed to fetch dropdowns');
  }

  return response.json();
};

export const fetchSpecificDropdown = async (dropdownName: string) => {
  console.log('Fetching dropdown:', dropdownName);
  const token = getAuthToken();
  if (!token) {
    throw new Error('Auth token missing - are you logged in?');
  }
  console.log('Using token:', token);
  const response = await fetch(`${API_BASE_URL}/dropdown/${dropdownName}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.error("Dropdown fetch error:", response.status, await response.text());
    throw new Error(`Failed to fetch ${dropdownName} dropdown`);
  }

  return response.json();
};

export const fetchCountryDropdown = async () => {
  console.log('Fetching country dropdown');
  const token = getAuthToken();
  if (!token) {
    throw new Error('Auth token missing - are you logged in?');
  }
  console.log('Using token:', token);
  const response = await fetch(`${API_BASE_URL}/country-dropdown`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.error("Country dropdown error:", response.status, await response.text());
    throw new Error('Failed to fetch country dropdown');
  }

  return response.json();
};
