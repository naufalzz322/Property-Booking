import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // Admin provider - use id "credentials" for default behavior
    CredentialsProvider({
      id: "credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as any,
        };
      },
    }),
    // Tenant provider
    CredentialsProvider({
      id: "tenant",
      name: "Tenant",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const tenant = await prisma.tenant.findFirst({
          where: { email: credentials.email, isActive: true },
        });

        if (!tenant) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          tenant.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: tenant.id,
          email: tenant.email,
          name: tenant.name,
          role: "TENANT" as any,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Separate auth options for tenant (to avoid conflicts)
export const tenantAuthOptions: NextAuthOptions = {
  ...authOptions,
  pages: {
    signIn: "/tenant/login",
  },
};

export default NextAuth(authOptions);
