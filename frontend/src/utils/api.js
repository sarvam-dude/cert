import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:12001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`HTTP ${status}:`, data?.message || 'Unknown error');
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error: No response received');
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const certificateAPI = {
  // Upload certificate
  uploadCertificate: async (formData, onUploadProgress) => {
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to upload certificate'
      );
    }
  },

  // Get certificate info
  getCertificateInfo: async (id) => {
    try {
      const response = await api.get(`/certificate/${id}/info`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to get certificate info'
      );
    }
  },

  // Get certificate file URL
  getCertificateUrl: (id) => {
    return `${API_BASE_URL}/certificate/${id}`;
  },

  // Get QR code URL
  getQRCodeUrl: (id) => {
    return `${API_BASE_URL}/certificate/${id}/qr`;
  },

  // Check if certificate exists and is valid
  checkCertificate: async (id) => {
    try {
      const response = await api.get(`/certificate/${id}/info`);
      return { exists: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 404) {
        return { exists: false, error: 'Certificate not found' };
      }
      if (error.response?.status === 410) {
        return { exists: false, error: 'Certificate has expired' };
      }
      throw error;
    }
  },
};

// Utility functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isValidFileType = (file) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  return allowedTypes.includes(file.type) && allowedExtensions.includes(fileExtension);
};

export const getMaxFileSize = () => {
  return parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
};

export default api;