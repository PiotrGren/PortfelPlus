import { auth } from "@/auth";
import { SignOutButton } from "@/common/components/auth/authButtons/signOutButton";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    // Jeśli użytkownik nie jest zalogowany, wyrzuć go na logowanie
    if (!session) {
        redirect("/auth/login");
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#B266FF]">Dashboard (DEBUG)</h1>
                    <SignOutButton />
                </div>

                <div className="bg-gray-900 p-6 rounded-xl overflow-x-auto border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Dane Sesji Użytkownika:</h2>
                    <pre className="text-sm text-green-400">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}