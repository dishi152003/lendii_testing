import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Fallback for Demo account to allow testing even without DB
          if (
            credentials.email.toLowerCase() === "demo@example.com" &&
            credentials.password === "password123"
          ) {
            return {
              id: "mock-id-123",
              email: "demo@example.com",
              name: "Demo User (Mock Mode)",
            };
          }

          await connectDB();

          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          });

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          // If DB connection fails, still allow the demo user above
          if (
            credentials.email.toLowerCase() === "demo@example.com" &&
            credentials.password === "password123"
          ) {
             return {
              id: "mock-id-123",
              email: "demo@example.com",
              name: "Demo User (Mock Mode)",
            };
          }
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account?.provider === "google") {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
