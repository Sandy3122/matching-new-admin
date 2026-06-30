import { API_BASE_URL, getAuthToken } from './config';

/**
 * Plan enquiry admin API.
 * Mirrors legacy routes: GET /plan-enquiries, PATCH /plan-enquiries/:id/status
 * (functions/src/controllers/planEnquiryController.js).
 */

export const PLAN_ENQUIRY_STATUS_OPTIONS = ['pending', 'contacted', 'followup', 'closed'] as const;
export type PlanEnquiryStatus = (typeof PLAN_ENQUIRY_STATUS_OPTIONS)[number];

export interface PlanEnquiry {
  id: string;
  customerUserId?: string;
  customerUserName?: string;
  registeredMobileNumber?: string;
  planEnquiryName?: string;
  planEnquiryAmount?: string | number;
  planEnquiryDateTime?: string;
  planEnquiryStatus?: PlanEnquiryStatus;
  planEnquiryComments?: string;
  planEnquiryFollowUpDateTime?: string;
  planEnquiryFollowUpComments?: string;
  planEnquiryActionByAdminId?: string;
  planEnquiryActionDateTime?: string;
  [key: string]: unknown;
}

export interface PlanEnquiryUpdate {
  planEnquiryStatus: PlanEnquiryStatus;
  planEnquiryComments?: string;
  planEnquiryFollowUpDateTime?: string;
  planEnquiryFollowUpComments?: string;
}

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchPlanEnquiries = async (limit = 500): Promise<PlanEnquiry[]> => {
  const response = await fetch(`${API_BASE_URL}/plan-enquiries?limit=${limit}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch plan enquiries');
  }
  const data = await response.json();
  return data?.enquiries ?? data?.data ?? data ?? [];
};

export const updatePlanEnquiryStatus = async (enquiryId: string, update: PlanEnquiryUpdate) => {
  const response = await fetch(`${API_BASE_URL}/plan-enquiries/${enquiryId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to update plan enquiry status');
  }
  return response.json();
};
