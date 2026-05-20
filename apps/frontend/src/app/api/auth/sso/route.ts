import { signIn } from "@/auth";

export async function GET() { //request: Request
    // const url = new URL(request.url)
    // const callbackUrl = url.searchParams.get("callbackUrl") || "/dashboard" xxx
    
    return signIn("microsoft-entra-id", { redirectTo: "/dashboard" }); // { redirectTo: `/auth/sync?callbackUrl=${encodeURIComponent(callbackUrl)}` }
};