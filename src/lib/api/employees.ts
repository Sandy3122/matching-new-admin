
import { API_BASE_URL, getAuthToken } from './config';

export const fetchAllEmployees = async () => {
  console.log('Fetching all employees');
  const token = getAuthToken();
  const url = `${API_BASE_URL}/getall-employees`;

  // Try with auth first (if available), then gracefully fallback without auth
  const headersWithAuth: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const headersNoAuth: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let response = await fetch(url, { headers: headersWithAuth });

  if (!response.ok && (response.status === 401 || response.status === 403)) {
    console.warn('getall-employees unauthorized with token, retrying without Authorization header');
    response = await fetch(url, { headers: headersNoAuth });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('Failed to fetch employees:', response.status, text);
    throw new Error('Failed to fetch employees');
  }

  return response.json();
};

export const searchEmployees = async (query: string) => {
  console.log('Searching employees with query:', query);
  const token = getAuthToken();
  const url = `${API_BASE_URL}/employee-search?query=${encodeURIComponent(query)}`;

  const headersWithAuth: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const headersNoAuth: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let response = await fetch(url, { headers: headersWithAuth });
  if (!response.ok && (response.status === 401 || response.status === 403)) {
    console.warn('employee-search unauthorized with token, retrying without Authorization header');
    response = await fetch(url, { headers: headersNoAuth });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('Failed to search employees:', response.status, text);
    throw new Error('Failed to search employees');
  }

  return response.json();
};

export const resetEmployeePassword = async (employeeId: string, newPassword: string) => {
  console.log('Resetting password for employee:', employeeId);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reset-employeePassword`, {
    method: 'PATCH',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: employeeId, newPassword }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to reset employee password');
  }
  
  return response.json();
};

export const updateEmployeeStatus = async (employeeId: string, status: string) => {
  console.log('Updating employee status:', employeeId, status);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/updateEmployeeStatus`, {
    method: 'PATCH',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ employeeId, status }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update employee status');
  }
  
  return response.json();
};

export const updateEmployeeRole = async (employeeId: string, role: string) => {
  console.log('Updating employee role:', employeeId, role);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/updateEmployeeRole`, {
    method: 'PATCH',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ employeeId, role }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update employee role');
  }
  
  return response.json();
};
