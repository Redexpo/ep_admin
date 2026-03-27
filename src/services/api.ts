import axios from "axios";
import { API_BASE_URL, COOKIE_DOMAIN } from "@/lib/constants";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error);

        // Check if this is a 401 Unauthorized error
        const is401Error = error.response?.status === 401;

        if (is401Error) {
            console.error("Session expired or invalid. Clearing auth tokens...");

            Cookies.remove("auth_token", { path: '/', domain: COOKIE_DOMAIN });
            Cookies.remove("token_type", { path: '/', domain: COOKIE_DOMAIN });

            Cookies.remove("auth_token", { path: '/' });
            Cookies.remove("token_type", { path: '/' });

            // In a real app, we would redirect to login
            // but for now, we'll just log the error
        }

        const message = error.response?.data?.message || error.response?.data?.detail || error.message || "An unexpected error occurred";
        return Promise.reject(new Error(message));
    }
);

export default api;
