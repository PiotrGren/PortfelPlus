import { NextResponse } from "next/server";
import { auth } from "@/auth";

const APIAuthPrefix = "/api/auth/"

export default auth((req: { auth?: any; nextUrl?: any; }) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    const isAPIAuthRoute = nextUrl.pathname.startsWith(APIAuthPrefix)
    if (isAPIAuthRoute) return NextResponse.next()

    if (nextUrl.pathname === "/") return NextResponse.next()
    if (nextUrl.pathname.startsWith("/auth/sync")) return NextResponse.next()
    if (nextUrl.pathname.startsWith("/auth/login")) return NextResponse.next()

    if (!isLoggedIn) {
        const url = new URL("/", nextUrl)
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}