import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const authConfig: NextAuthConfig = {
  adapter: undefined, // 在 auth.ts 中设置 PrismaAdapter
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    // 将 user.id 写入 JWT token；当客户端调用 update() 时，从数据库重新读取最新的 name/image
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      // 客户端触发 session 更新时，从数据库重新读取最新的昵称和头像
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, image: true },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    // 将 token 中的 id/name/email/image 显式回填到 session.user，确保客户端 session 刷新后立即生效
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string | null) ?? null;
        session.user.email = (token.email as string | null) ?? "";
        session.user.image = (token.picture as string | null) ?? null;
      }
      return session;
    },
  },
};
