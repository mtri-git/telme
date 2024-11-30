import { LOCAL_STORAGE_KEY } from "@/constants/localStorage";
import axios from "axios";
import axiosInstance from "@/utils/axios";

const login = async (email, password) => {
  try {
    const axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 10000,
      withCredentials: true,
    });

    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    const { data } = response.data;

    localStorage.setItem(
      LOCAL_STORAGE_KEY.accessToken,
      data.tokens.accessToken
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEY.refreshToken,
      data.tokens.refreshToken
    );
    localStorage.setItem(LOCAL_STORAGE_KEY.userInfo, JSON.stringify(data.user));

    axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

    return data;
  } catch (err) {
    console.log("🚀 ~ login ~ err:", err);
    throw err;
  }
};

const logout = async () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
    localStorage.removeItem(LOCAL_STORAGE_KEY.refreshToken);
    window.location.href = "/login";
  } catch (err) {
    throw err;
  }
};

const getMe = async () => {
  try {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  } catch (err) {
    throw err;
  }
};

const authService = {
  login,
  logout,
  getMe,
};

export default authService;
