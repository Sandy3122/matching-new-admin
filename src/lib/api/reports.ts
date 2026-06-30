import { API_BASE_URL, getAuthToken } from './config';
import { fetchAllUsers } from './users';

/**
 * Reported-users admin API.
 * The legacy app stores reports inside each appusers doc under `reportedBy[]`.
 * Admins resolve reports via PATCH /updateReportAction
 * (functions/src/controllers/reportUserController.js).
 */

export interface UserReport {
  reporterId: string;
  reporterName: string;
  reportedDateAndTime: string;
  reportedComment: string;
  actionStatus: 'pending' | 'reviewed' | 'actioned' | 'dismissed' | string;
  actionRemarks: string;
  actionDateAndTime: string;
}

export interface ReportedUser {
  id: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  registeredMobileNumber?: string;
  reportedBy: UserReport[];
}

/**
 * Derives the reported-user list from the full appusers collection, since the
 * legacy backend exposes no dedicated "list reports" endpoint.
 */
export const fetchReportedUsers = async (): Promise<ReportedUser[]> => {
  const users = await fetchAllUsers();
  // getall-appUsers returns documents shaped as { id, data: {...} }.
  return (Array.isArray(users) ? users : [])
    .map((u: any) => ({ id: u.id, ...(u.data || u) }))
    .filter((u: any) => Array.isArray(u?.reportedBy) && u.reportedBy.length > 0)
    .map((u: any) => ({
      id: u.id,
      customerId: u.customerId,
      firstName: u.firstName,
      lastName: u.lastName,
      registeredMobileNumber: u.registeredMobileNumber,
      reportedBy: u.reportedBy,
    }));
};

export interface ReportActionUpdate {
  reportedUserId: string;
  reporterId?: string | null;
  actionStatus?: string;
  actionRemarks?: string;
  actionDateAndTime?: string;
}

export const updateReportAction = async (update: ReportActionUpdate) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/updateReportAction`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to update report action');
  }
  return response.json();
};
