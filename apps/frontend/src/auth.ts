import NextAuth from "next-auth"
import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id"
import Google from "next-auth/providers/google"; 
import GitHub from "next-auth/providers/github";

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
    })
  ],

  callbacks: {
    async jwt({ token, account }) {
        if (account) {
            token.accessToken = account.access_token;
            token.idToken = account.id_token;
            token.expiresAt = account.expires_at;
            token.refreshToken = account.refresh_token;
        }
        return token;
    },

    session: async function ({ session, token }) {
        session.accessToken = token.accessToken as string | undefined
        session.idToken = token.idToken as string | undefined
        session.expiresAt = token.expiresAt as number | undefined
        return session
    }
  }
})