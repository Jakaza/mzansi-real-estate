import axios from "axios";

const apiRequest = axios.create({
  baseURL: 'https://mzansi-real-estate-api.onrender.com/api',
  withCredentials: true,
});

export default apiRequest;
