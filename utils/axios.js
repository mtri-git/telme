import axios from "axios";
import { LOCAL_STORAGE_KEY } from "@/constants/localStorage";

const REFRESH_TOKEN_URL = "/auth/renew-token"; 

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Thay bằng base URL của bạn
  // timeout: 10000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(LOCAL_STORAGE_KEY.accessToken);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEY.refreshToken);
        if(!refreshToken) {
          throw new Error("Refresh token not found");
        }

        const { data } = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + REFRESH_TOKEN_URL, { refreshToken });
        const responseData = data.data

        const newAccessToken = responseData.tokens.accessToken;
        localStorage.setItem(LOCAL_STORAGE_KEY.accessToken, newAccessToken);
        localStorage.setItem(LOCAL_STORAGE_KEY.refreshToken, responseData.tokens.refreshToken);

        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);

        localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
        localStorage.removeItem(LOCAL_STORAGE_KEY.refreshToken);
        localStorage.removeItem(LOCAL_STORAGE_KEY.userInfo);

        // Session can't be recovered: send the user to log in again
        const publicPaths = ["/login", "/register"];
        if (typeof window !== "undefined" && !publicPaths.includes(window.location.pathname)) {
          window.location.href = "/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
