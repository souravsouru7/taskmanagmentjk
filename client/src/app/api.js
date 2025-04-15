import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000
});

// Add request interceptor for authentication
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // For debugging
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    
    // If token exists, add to headers with Bearer prefix
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token attached to request');
    } else {
      console.log('No token available for request');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} for ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication error - removing token');
      // Clear local storage and redirect to login if token is invalid
      localStorage.removeItem('token');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Ensure error object has the expected structure for the application
    if (!error.response) {
      console.log('Network error detected');
      // Network error or other non-response error
      error.response = { 
        data: { 
          message: 'Network error or server unavailable. Please check your connection.'
        }
      };
    } else if (!error.response.data) {
      console.log('No error data provided');
      error.response.data = { message: error.message || 'Unknown error occurred' };
    } else if (typeof error.response.data === 'object' && !error.response.data.message) {
      console.log('Error data without message property');
      // If data exists but doesn't have a message property
      error.response.data.message = error.message || 'An error occurred';
    }
    
    console.log('Final error message:', error.response.data.message);
    return Promise.reject(error);
  }
);

export default API; 