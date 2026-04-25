import type { User } from "next-auth";
import NextAuth from "next-auth"
import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id"
import Google from "next-auth/providers/google"; 
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
        credentials: {
            access_token: { label: "Token", type: "text" }
        },
        authorize: async (credentials) => {
            if (credentials?.access_token) {
                // Udajemy użytkownika, pakując nasz JWT token
                return { id: "1", access_token: credentials.access_token, provider: "local" } as unknown as User;
            }
            return null;
        }
    }),
  ],

  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
        // Zapisywanie danych przy logowaniu (z konta SSO lub credentials)
        if (account) {
            token.accessToken = account.access_token || (user as { access_token?: string })?.access_token;
            token.provider = account.provider || "local";
        }
        // Umożliwia zaktualizowanie tokenu po synchronizacji SSO (z update() na froncie)
        if (trigger === "update" && session?.accessToken) {
            token.accessToken = session.accessToken;
            token.provider = session.provider;
        }
        return token;
    },

    session: async function ({ session, token }) {
        session.accessToken = token.accessToken as string | undefined
        session.provider = token.provider as string | undefined // Przekazujemy dostawcę na front
        return session
    }
  }
})