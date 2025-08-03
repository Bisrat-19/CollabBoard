// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? "https://collabboard-backend-bli2.onrender.com"
    : "http://localhost:5000", 
  API_PREFIX: "/api",
}

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`
} 