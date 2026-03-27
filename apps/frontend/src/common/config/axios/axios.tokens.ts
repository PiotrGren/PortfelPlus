import type { Session } from "next-auth";

let cachedAccessToken: string | null = null;
let cacheUntil = 0;

export function setCachedAccessToken(token: string | null, ttlMs = 60_000) {
    cachedAccessToken = token;
    cacheUntil = token ? Date.now() + ttlMs : 0;
}

export async function getClientAccessToken(): Promise<string | null> {
    if (cachedAccessToken && Date.now() < cacheUntil) return cachedAccessToken;

    // Używamy dynamicznego importu, bo getClientAccessToken będzie 
    // wywoływane przez Axios, który nie wie o komponentach React
    const mod = await import("next-auth/react");
    const session = (await mod.getSession()) as Session | null;
    const token = session?.accessToken ?? null;

    setCachedAccessToken(token, 60_000);
    return token;
}

export async function refreshClientTokenIfPossible(): Promise<string | null> {
    // 1. Zabezpieczamy się na wypadek SSO vs Custom JWT.
    // Jeśli używacie Custom JWT (nie SSO), to ten kod uderzy do Twojego backendu
    // i zwróci nowy token. Na ten moment jest to placeholder.
    
    // Przykład logiki pod DRF SimpleJWT:
    /*
    try {
        const refreshToken = await getRefreshTokenFromSomewhere();
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`, {
            refresh: refreshToken
        });
        const newAccessToken = response.data.access;
        // Wymagane byłoby zaktualizowanie sesji Auth.js lub zrobienie tego z poziomu cookie
        setCachedAccessToken(newAccessToken, 60_000);
        return newAccessToken;
    } catch (e) {
        setCachedAccessToken(null, 0);
        return null;
    }
    */

    setCachedAccessToken(null, 0);
    return await getClientAccessToken();
}