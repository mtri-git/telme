import { LOCAL_STORAGE_KEY } from "@/constants/localStorage";
import axios from "axios";
import axiosInstance from "@/utils/axios";

const localAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

const login = async (email, password) => {
  try {

    const response = await localAxios.post("/auth/login", {
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

    localAxios.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

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
    const accessToken = localStorage.getItem(LOCAL_STORAGE_KEY.accessToken);
    if(!accessToken) {
      return { data: null}
    }

    const response = await axiosInstance.get("/users/me");
    return response.data;
  } catch (err) {
    throw err;
  }
};

const register = async (data) => {
  try {
    const response = await localAxios.post("/users/register", data);
    return response.data;
  } catch (err) {
    throw err;
  }
}

const authService = {
  login,
  logout,
  getMe,
  register
};

export default authService;
