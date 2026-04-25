import { auth } from "@/auth";
import { SignOutButton } from "@/common/components/auth/authButtons/signOutButton";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session || !session.accessToken) {
        redirect("/auth/login");
    }

    // Zabezpieczamy się przed brakiem zmiennej środowiskowej
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Pobieranie profilu użytkownika bezpośrednio z naszego Django
    const res = await fetch(`${API_URL}/api/auth/me/`, {
        headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
        },
        cache: 'no-store' // Wymuszamy zawsze świeże dane
    });

    if (!res.ok) {
        // Jeśli token wygasł lub jest zły, Django rzuci 401
        redirect("/auth/login?session_expired=true");
    }

    const userData = await res.json();

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-4xl mx-auto bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#B266FF]">Wallet+ Dashboard</h1>
                    <SignOutButton />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700">
                        <h2 className="text-xl font-semibold mb-4 border-b border-zinc-700 pb-2">Profil Użytkownika</h2>
                        <ul className="space-y-3 text-zinc-300">
                            <li><strong className="text-zinc-100">Email:</strong> {userData.email}</li>
                            <li><strong className="text-zinc-100">Imię i nazwisko:</strong> {userData.full_name || "Brak"}</li>
                            <li><strong className="text-zinc-100">Dostawca:</strong> <span className="capitalize">{userData.auth_provider}</span></li>
                            {userData.nickname && <li><strong className="text-zinc-100">Pseudonim:</strong> {userData.nickname}</li>}
                        </ul>
                    </div>

                    <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700">
                        <h2 className="text-xl font-semibold mb-4 border-b border-zinc-700 pb-2">Dane JWT (Debug)</h2>
                        <p className="text-xs text-zinc-400 break-all bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                            {session.accessToken}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}