// src/api.jsx
import axios from "axios";

// export const BASE_URL = "http://localhost:5237/api";

export const BASE_URL = "https://apiaumenu.mmm2007.net/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // config.headers["X-API-KEY"] = "66CC0EF1-7AF1-4600-8EFC-9897902FA73C";

  return config;
});
// // ================== global 401 handling ==================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ล้าง token และ branchCode
      // sessionStorage.removeItem("token");
      // redirect ไป /home
      // window.location.href = "/";
    }
    return Promise.reject(error);
  }
);


