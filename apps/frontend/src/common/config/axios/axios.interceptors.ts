import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { normalizeAPIClientError, type APIClientError } from "./axios.errors";

type TokenProvider = () => Promise<string | null>;
type RefreshProvider = () => Promise<string | null>;

export type InterceptorsOptions = {
    getAccessToken: TokenProvider;
    refreshToken?: RefreshProvider;
    onUnauthorized?: (err: APIClientError) => void | Promise<void>;
};

// Ścieżki, przy których Axios ma NIE próbować automatycznie odświeżać tokenu po dostaniu błędu 401
function shouldAttemptRefresh(url?: string): boolean {
    if (!url) return true;
    const excludedUrls = ["/api/auth/", "/api/login", "/api/token/refresh"];
    return !excludedUrls.some(excluded => url.includes(excluded));
}

export function attachInterceptors(api: AxiosInstance, opts: InterceptorsOptions) {
    api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
        config.headers = config.headers ?? {};
        config.headers["Accept-Language"] = "pl"; // Zmienione na polski
        config.headers["Content-Type"] = config.headers["Content-Type"] ?? "application/json";

        const token = await opts.getAccessToken();
        if (token) {
            // DRF (SimpleJWT) domyślnie używa przedrostka "Bearer"
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
    });

    api.interceptors.response.use(
        (res) => res,
        async (err) => {
            const normalized = normalizeAPIClientError(err);
            const originalRequest = (err?.config ?? {}) as InternalAxiosRequestConfig & { _retry?: boolean };
            const url = originalRequest.url;

            if (normalized.status === 401 && !originalRequest._retry && shouldAttemptRefresh(url)) {
                originalRequest._retry = true;

                if (opts.refreshToken) {
                    const newToken = await opts.refreshToken();
                    if (newToken) {
                        originalRequest.headers = originalRequest.headers ?? {};
                        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                        return api.request(originalRequest);
                    }
                }

                if (opts.onUnauthorized) {
                    await opts.onUnauthorized(normalized);
                }
            }

            throw normalized;
        }
    );
}