import { API_BASE_URL, getAuthToken } from './config';

/**
 * Notification admin API layer.
 * Mirrors the legacy backend routes mounted under `/admin/notifications/*`
 * (see functions/src/routes/routes.js + notificationController.js).
 */

const authHeaders = (json = true): Record<string, string> => {
  const token = getAuthToken();
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handle = async (response: Response, errorMessage: string) => {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error(errorMessage, response.status, text);
    throw new Error(errorMessage);
  }
  return response.json().catch(() => ({}));
};

// ---------- Audience / users ----------

export interface NotificationUser {
  id?: string;
  userId?: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  registeredMobileNumber?: string;
  [key: string]: unknown;
}

export const listNotificationUsers = async (limit = 500): Promise<NotificationUser[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/topic-users?limit=${limit}`, {
    headers: authHeaders(),
  });
  const data = await handle(response, 'Failed to load notification users');
  return data?.data ?? data ?? [];
};

// ---------- Manual send / queue ----------

export interface ManualSendPayload {
  targetType: 'user' | 'topic';
  userId?: string;
  topic?: string;
  type?: string;
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  data?: Record<string, unknown>;
}

export const sendManualNotification = async (payload: ManualSendPayload) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/manual-send`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(response, 'Failed to send notification');
};

export const processNotificationQueue = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/queue/process`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handle(response, 'Failed to process notification queue');
};

// ---------- Topics ----------

export interface NotificationTopic {
  id: string;
  topicName?: string;
  description?: string;
  isSystemTopic?: boolean;
  isActive?: boolean;
  createdAt?: unknown;
  [key: string]: unknown;
}

export const listTopics = async (): Promise<NotificationTopic[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/topics`, {
    headers: authHeaders(),
  });
  const data = await handle(response, 'Failed to list topics');
  return data?.data ?? data ?? [];
};

export const createTopic = async (payload: { topicName: string; description?: string }) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/topics`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(response, 'Failed to create topic');
};

export const updateTopic = async (topic: string, payload: { description?: string; isActive?: boolean }) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/topics/${encodeURIComponent(topic)}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(response, 'Failed to update topic');
};

export const deleteTopic = async (topic: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/topics/${encodeURIComponent(topic)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handle(response, 'Failed to delete topic');
};

export const subscribeUsersToTopic = async (
  topic: string,
  payload: { allUsers?: boolean; userIds?: string[] },
) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/notifications/topics/${encodeURIComponent(topic)}/subscribe-users`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );
  return handle(response, 'Failed to subscribe users to topic');
};

export const unsubscribeUsersFromTopic = async (
  topic: string,
  payload: { allUsers?: boolean; userIds?: string[] },
) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/notifications/topics/${encodeURIComponent(topic)}/unsubscribe-users`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );
  return handle(response, 'Failed to unsubscribe users from topic');
};

// ---------- Campaigns ----------

export interface CampaignPayload {
  title: string;
  body: string;
  type?: string;
  imageUrl?: string;
  deepLink?: string;
  audience: {
    targetType: 'user' | 'topic';
    userId?: string;
    topic?: string;
  };
}

export const listCampaigns = async (limit = 100) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/campaigns?limit=${limit}`, {
    headers: authHeaders(),
  });
  const data = await handle(response, 'Failed to list campaigns');
  return data?.data ?? data ?? [];
};

export const createCampaign = async (payload: CampaignPayload) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/campaign`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(response, 'Failed to create campaign');
};

export const sendCampaignNow = async (campaignId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/campaign/${campaignId}/send`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handle(response, 'Failed to send campaign');
};

export const scheduleCampaign = async (campaignId: string, scheduledAt: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/campaign/${campaignId}/schedule`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ scheduledAt }),
  });
  return handle(response, 'Failed to schedule campaign');
};

export const cancelCampaign = async (campaignId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/campaign/${campaignId}/cancel`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handle(response, 'Failed to cancel campaign');
};

// ---------- Monitoring ----------

export const fetchNotificationAnalytics = async (rangeHours = 168) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/notifications/analytics?rangeHours=${rangeHours}`,
    { headers: authHeaders() },
  );
  const data = await handle(response, 'Failed to fetch notification analytics');
  return data?.data ?? data ?? {};
};

export const fetchNotificationFailures = async (limit = 300) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/failures?limit=${limit}`, {
    headers: authHeaders(),
  });
  const data = await handle(response, 'Failed to fetch notification failures');
  return data?.data ?? data ?? [];
};

export const fetchNotificationSuccesses = async (limit = 300) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/success?limit=${limit}`, {
    headers: authHeaders(),
  });
  const data = await handle(response, 'Failed to fetch successful notifications');
  return data?.data ?? data ?? [];
};

export const retryFailedNotification = async (notificationId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/retry`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ notificationId }),
  });
  return handle(response, 'Failed to retry notification');
};

export const fetchEventNotificationLogs = async (params: {
  type?: string;
  status?: string;
  limit?: number;
} = {}) => {
  const search = new URLSearchParams();
  if (params.type) search.set('type', params.type);
  if (params.status) search.set('status', params.status);
  search.set('limit', String(params.limit ?? 100));
  const response = await fetch(`${API_BASE_URL}/admin/notifications/event-logs?${search.toString()}`, {
    headers: authHeaders(),
  });
  const data = await handle(response, 'Failed to fetch event notification logs');
  return data?.data ?? data ?? [];
};
