import axios from "axios";

const API = axios.create({
  baseURL: "https://ismabasa123.loca.lt/api/auth", // change to your backend IP + port
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;