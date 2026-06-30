
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

/**
 * Create a new role with access rights.
 * Mirrors legacy POST /access-rights { role, status }.
 */
export const addAccessRight = async (payload: { role: string; status: 'active' | 'inactive'; roleLabel?: string }) => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/access-rights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to add access right');
  }

  return response.json().catch(() => ({ message: 'Role created successfully' }));
};

/**
 * Update the list of routes a role can access.
 * Mirrors legacy PATCH /access-rights/:id/routes { routeName: string[] }.
 */
export const updateAccessRightRoutes = async ({
  id,
  routeName,
}: {
  id: string;
  routeName: string[];
}) => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/access-rights/${id}/routes`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ routeName }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to update access right routes');
  }

  return response.json().catch(() => ({ message: 'Routes updated successfully' }));
};
