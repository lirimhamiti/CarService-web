import axios from "axios";
import { env } from "../config/env";

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  response => response,
  error => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      "Unexpected error";

    return Promise.reject(new Error(message));
  }
);
