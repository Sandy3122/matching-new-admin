
import { API_BASE_URL, getAuthToken } from './config';

export const fetchUserProfile = async (userId: string) => {
  console.log('Fetching user profile for:', userId);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getUserFiles/${userId}`, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  
  return response.json();
};

export const fetchAllUsers = async () => {
  console.log('Fetching all users');
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getall-appUsers`, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return response.json();
};

export const fetchAllUsersWithDetails = async () => {
  console.log('Fetching all users with details');
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getall-appUsers`, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  const users = await response.json();
  
  // Fetch profile images for each user.
  // Legacy convention: imgList[5] = profile image, imgList[6] = selfie.
  const usersWithImages = await Promise.all(
    users.map(async (user: any) => {
      try {
        const imageData = await fetchUserImageList(user.id);
        const imgList = Array.isArray(imageData?.imgList) ? imageData.imgList : [];
        const profileImage = imgList[5] || imgList.find((img: any) => img?.imgUrl) || null;
        return {
          ...user,
          profileImage: profileImage?.imgUrl || null,
          isProfileImageVerified: profileImage?.imgVerificationStatus === 'verified'
        };
      } catch (error) {
        return {
          ...user,
          profileImage: null,
          isProfileImageVerified: false
        };
      }
    })
  );
  
  return usersWithImages;
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

export const updateUserData = async (userId: string, updatedData: any) => {
  console.log('Updating user data for:', userId, updatedData);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/updateUserData`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, updatedData }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user data');
  }
  
  return response.json();
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
  console.log('Resetting password for user:', userId);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reset-userPassword`, {
    method: 'PATCH',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: userId, newPassword }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to reset password');
  }
  
  return response.json();
};

export const registerUser = async (userData: any) => {
  console.log('Registering new user:', userData);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user-registration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Send auth so the backend can stamp `accountCreatedBy` from the session user.
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to register user');
  }
  
  return response.json();
};

export const fetchUserById = async (userId: string, fields?: string) => {
  console.log('Fetching user by ID:', userId, 'with fields:', fields);
  const token = getAuthToken();
  if (!token) {
    throw new Error('Auth token missing - are you logged in?');
  }
  
  const url = fields ? `${API_BASE_URL}/appusers/${userId}?fields=${fields}` : `${API_BASE_URL}/appusers/${userId}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
};

export const fetchAdminProfile = async () => {  console.log('Fetching admin profile');
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin profile');
  }
  const data = await response.json();
  console.log('Admin profile data:', data);
  return data;
};

/**
 * Fetch a user's interest/interaction data.
 * Mirrors legacy GET /user-interest/:id which returns:
 * userVisitedList, userShortlistedList, userSentInterestList,
 * availableContactCount, viewContactDetailsList.
 */
export const fetchUserInterest = async (userId: string) => {
  console.log('Fetching user interest for:', userId);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user-interest/${userId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user interest');
  }

  return response.json();
};

/**
 * Fetch the profile field-set used for profile PDF generation.
 * Mirrors legacy GET /generateProfilesPdfs/:id (falls back to /getProfileData/:id).
 */
export const fetchProfilePdfData = async (userId: string) => {
  console.log('Fetching profile PDF data for:', userId);
  const token = getAuthToken();
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    'Content-Type': 'application/json',
  };

  let response = await fetch(`${API_BASE_URL}/generateProfilesPdfs/${userId}`, { headers });
  if (!response.ok) {
    response = await fetch(`${API_BASE_URL}/getProfileData/${userId}`, { headers });
  }

  if (!response.ok) {
    throw new Error('Failed to fetch profile data');
  }

  return response.json();
};
