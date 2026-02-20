import axios from "axios";

const customAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
  },
});

export default customAxios;
