// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

export const getApiUrl = (endpoint) => {
   return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

export default API_BASE_URL;
