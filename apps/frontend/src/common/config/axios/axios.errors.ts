import { type AxiosError } from "axios";

export type APIClientError = {
    message: string;
    status?: number;
    code?: string;
    data?: unknown;
    isNetworkError: boolean;
    isApiError: boolean;
    original: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export function isLikelyAxiosError(error: unknown): error is AxiosError {
    return isObject(error) && ("isAxiosError" in error || "config" in error);
}

/**
 * Wyciąga wiadomości z błędów Django REST Framework:
 * - { detail: "..." }
 * - { non_field_errors: ["..."] }
 * - { field_name: ["...", "..."] }
 */
export function extractMsgFromResponse(data: unknown): string | undefined {
    if (!isObject(data)) return undefined;

    // DRF generic error
    const detail = getString(data.detail);
    if (detail) return detail;

    // DRF non-field validation errors
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
        const msg = getString(data.non_field_errors[0]);
        if (msg) return msg;
    }

    // DRF field-specific validation errors (łapie pierwszy błąd z brzegu)
    for (const key in data) {
        const val = data[key];
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
            return `${key}: ${val[0]}`; 
        }
    }

    // Fallback na standardowe formaty
    const message = getString(data.message);
    if (message) return message;

    const error = getString(data.error);
    if (error) return error;

    return undefined;
}

export function normalizeAPIClientError(error: unknown, fallbackMessage = "Coś poszło nie tak"): APIClientError {
    if (isLikelyAxiosError(error)) {
        const axiosErr = error as AxiosError;
        const status = axiosErr.response?.status;
        const code = axiosErr.code;

        if (axiosErr.response) {
            const data = axiosErr.response.data;
            const message = extractMsgFromResponse(data) ?? getString(axiosErr.message) ?? fallbackMessage;

            return {
                message, status, code, data,
                isNetworkError: false,
                isApiError: true,
                original: error,
            };
        }

        if (axiosErr.request) {
            return {
                message: getString(axiosErr.message) ?? "Błąd sieci: brak odpowiedzi od serwera",
                status, code, data: undefined,
                isNetworkError: true,
                isApiError: false,
                original: error,
            };
        }

        return {
            message: getString(axiosErr.message) ?? fallbackMessage,
            status, code, data: undefined,
            isNetworkError: false,
            isApiError: false,
            original: error,
        };
    }

    if (error instanceof Error) {
        return {
            message: getString(error.message) ?? fallbackMessage,
            isNetworkError: false,
            isApiError: false,
            original: error,
        };
    }

    return {
        message: fallbackMessage,
        isNetworkError: false,
        isApiError: false,
        original: error,
    };
}