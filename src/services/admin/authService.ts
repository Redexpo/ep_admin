import api from "../api";
import Cookies from "js-cookie";
import { COOKIE_DOMAIN } from "@/lib/constants";
import { User } from "./userService";

class AuthService {
    async login(email: string, password: string) {
        try {
            const response = await api.post("/api/v1/admin/auth/login", { email, password });
            const { access_token } = response.data.data;

            // Set cookie
            Cookies.set("auth_token", access_token, {
                expires: 7,
                path: '/',
                domain: COOKIE_DOMAIN
            });

            return response.data;
        } catch (error: any) {
            console.error("AuthService login error:", error);
            throw error;
        }
    }

    async getCurrentUser(): Promise<User> {
        try {
            const response = await api.get("/api/v1/auth/me");
            return response.data.data;
        } catch (error: any) {
            console.error("AuthService getCurrentUser error:", error);
            throw error;
        }
    }

    async logout() {
        try {
            await api.post("/api/v1/admin/auth/logout");
        } catch (error) {
            console.error("AuthService logout error:", error);
        } finally {
            Cookies.remove("auth_token", { path: '/', domain: COOKIE_DOMAIN });
            if (typeof window !== "undefined") {
                window.location.href = "/admin/login";
            }
        }
    }
}

export const authService = new AuthService();
