const API_BASE_URL = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com';

export { API_BASE_URL };

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
      body
    });
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const error = new Error(`Server error: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    // Return data directly for success, throw error for failure
    if (!response.ok) {
      console.log('API Error Response:', response.status, data);
      const error = new Error(data?.message || `Error: ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.restricted = data?.restricted || data?.code === 'ACCOUNT_RESTRICTED';
      console.log('Error restricted flag:', error.restricted);
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please check if the backend is running on port 5000.');
    }
    throw error;
  }
};

export default apiRequest;
