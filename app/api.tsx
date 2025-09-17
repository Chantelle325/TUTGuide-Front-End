import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API = axios.create({
  baseURL: "https://ismabasa123.loca.lt/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to every request if it exists
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;