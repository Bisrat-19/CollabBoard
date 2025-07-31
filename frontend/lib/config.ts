// API Configuration
export const API_CONFIG = {
  // BASE_URL:"http://localhost:5000",
  BASE_URL: "https://collabboard-backend-bli2.onrender.com", 
  API_PREFIX: "/api",
}

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`
} 