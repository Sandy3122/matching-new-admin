
import { API_BASE_URL, getAuthToken } from './config';

export const fetchImageList = async () => {
  console.log('Fetching image list');
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getImageList`, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch image list');
  }
  
  return response.json();
};

export const fetchUserImageList = async (userId: string) => {
  console.log('Fetching user image list:', userId);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getImageList/${userId}`, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user image list');
  }
  
  return response.json();
};

export const updateImageStatus = async (userId: string, imageIndex: number, status: string) => {
  console.log('Updating image status:', userId, imageIndex, status);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/updateImageStatus`, {
    method: 'PATCH',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      userId, 
      imgIndex: imageIndex, 
      updateFields: { 
        imgVerificationStatus: status 
      } 
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update image status');
  }
  
  return response.json();
};

export const uploadUserDocs = async (userId: string, files: FormData) => {
  console.log('Uploading documents for user:', userId);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/uploadDocs`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: files,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload documents');
  }
  
  return response.json();
};
