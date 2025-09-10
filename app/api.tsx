import axios from "axios";

const API = axios.create({
  baseURL: "https://ismabasa123.loca.lt/api/auth", 
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;