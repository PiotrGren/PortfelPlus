import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { attachInterceptors } from "./axios.interceptors";
import { getClientAccessToken, refreshClientTokenIfPossible } from "./axios.tokens";

type GetApiClientOptions = {
    accessToken?: string;
};

export const getAxiosClient = () => {
    return axios.create({
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export class APIClient {
    constructor(
        private readonly client: AxiosInstance = getAxiosClient(),
        private readonly serverUrl: string = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
        private readonly accessTokenFromServer?: string
    ) {
        attachInterceptors(this.client, {
            getAccessToken: async () => {
                if (this.accessTokenFromServer) return this.accessTokenFromServer;
                return getClientAccessToken();
            },
            refreshToken: async () => {
                if (this.accessTokenFromServer) return this.accessTokenFromServer; // Server-side refresh requires extra logic
                return refreshClientTokenIfPossible();
            },
            onUnauthorized: async () => {
                if (typeof window !== "undefined") {
                    // Zmieniono na naszą stronę logowania
                    window.location.assign("/auth/login?session_expired=true");
                }
            },
        });
    }

    get __axios() { return this.client; }

    async get<T = unknown>(uri: string, config?: AxiosRequestConfig) {
        return this.client.get<T>(this.normalizeApiUrl(uri), config);
    }

    async getData<T>(uri: string, config?: AxiosRequestConfig) {
        const response = await this.client.get<T>(this.normalizeApiUrl(uri), config);
        return response.data;
    }

    async post<T, R = T>(uri: string, data?: T, config?: AxiosRequestConfig) {
        return this.client.post<R>(this.normalizeApiUrl(uri), data, config);
    }

    async put<T, R = T>(uri: string, data?: T, config?: AxiosRequestConfig) {
        return this.client.put<R>(this.normalizeApiUrl(uri), data, config);
    }

    async patch<T, R = T>(uri: string, data?: T, config?: AxiosRequestConfig) {
        return this.client.patch<R>(this.normalizeApiUrl(uri), data, config);
    }

    async delete<T = unknown>(uri: string, config?: AxiosRequestConfig) {
        return this.client.delete<T>(this.normalizeApiUrl(uri), config);
    }

    async deleteWithData<T>(uri: string, data?: T, config?: AxiosRequestConfig) {
        return this.client.delete(this.normalizeApiUrl(uri), { ...(config ?? {}), data });
    }

    private normalizeApiUrl(uri: string) {
        return uri.startsWith(this.serverUrl) ? uri : this.serverUrl + uri;
    }
}

let globalApiClient: APIClient | null = null;

export const getApiClient = (opts?: GetApiClientOptions) => {
    if (typeof window === "undefined") {
        return new APIClient(getAxiosClient(), process.env.NEXT_PUBLIC_API_URL, opts?.accessToken);
    }
    if (!globalApiClient) {
        globalApiClient = new APIClient(getAxiosClient(), process.env.NEXT_PUBLIC_API_URL);
    }
    return globalApiClient;
};

export const __resetApiClientForTests = () => { globalApiClient = null; };