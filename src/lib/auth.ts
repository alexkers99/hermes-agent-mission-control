import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // STRICT SECURITY: Only allow this specific email account
      if (user.email === "alexkers99@gmail.com") {
        return true;
      }
      console.error(`Unauthorized access attempt by: ${user.email}`);
      return false; // Reject all other users
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
  pages: {
    error: "/api/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
