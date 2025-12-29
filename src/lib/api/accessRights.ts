
import { API_BASE_URL, getAuthToken } from './config';

export interface RoutePermissions {
  [key: string]: ('read' | 'write')[];
}

export interface AccessRight {
  id: string;
  role: string;
  status: 'active' | 'inactive';
  routes: RoutePermissions;
  routeName: string[];
  timeStamp?: string;
}

export const fetchAccessRights = async (): Promise<AccessRight[]> => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/access-rights`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch access rights');
  }

  const data = await response.json();

  return data.map((role: any) => ({
    ...role,
    routeName: role.routeName || [],
    routes: (role.routeName || []).reduce((acc: RoutePermissions, route: string) => {
      acc[route] = ['read', 'write'];
      return acc;
    }, {}),
  }));
};

export const deleteAccessRight = async (id: string) => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/access-rights/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete access right');
  }

  return response.json().catch(() => ({ message: 'Deleted successfully' }));
};

export const updateAccessRightStatus = async ({ id, status }: { id: string, status: 'active' | 'inactive' }) => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/access-rights/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update access right status');
  }

  return response.json().catch(() => ({ message: 'Status updated successfully' }));
};
