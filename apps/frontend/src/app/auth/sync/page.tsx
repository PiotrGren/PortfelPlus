'use client';

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getApiClient } from "@/common/config/axios/axios.instance";

export default function SyncPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const isSyncing = useRef(false);

    useEffect(() => {
        // Zapobieganie podwójnemu wysłaniu w React 18 Strict Mode
        if (isSyncing.current) return;
        if (!session?.accessToken || !session?.provider) return;
        
        // Jeśli to logowanie lokalne (credentials), pomiń sync
        if (session.provider === 'local') {
            router.push('/dashboard');
            return;
        }

        const performSync = async () => {
            isSyncing.current = true;
            try {
                const api = getApiClient();
                
                // Mapowanie nazw z Auth.js na format oczekiwany przez Django
                const providerMap: Record<string, string> = {
                    "microsoft-entra-id": "microsoft",
                    "google": "google",
                    "github": "github"
                };
                
                const backendProvider = providerMap[session.provider as string];

                const res = await api.post<any, { access: string }>('/api/auth/sso/sync/', {
                    provider: backendProvider,
                    token: session.accessToken
                });

                await update({ 
                    accessToken: res.data.access, // <-- Dodane .data
                    provider: 'local' 
                });
                
                router.push('/dashboard');
            } catch (err) {
                console.error("SSO Sync Error:", err);
                // Błąd weryfikacji -> wyrzucamy na zewnątrz
                signOut({ callbackUrl: '/auth/login?error=sync_failed' });
            }
        };

        performSync();
    }, [session, router, update]);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-xl font-bold mb-4">Trwa weryfikacja logowania...</h1>
            <div className="w-12 h-12 border-4 border-[#B266FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}