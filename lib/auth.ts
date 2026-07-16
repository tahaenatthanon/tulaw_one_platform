import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function buildProviders(): NextAuthOptions["providers"] {
  const providers: NextAuthOptions["providers"] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const GoogleProvider = require("next-auth/providers/google").default;
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  providers.push(
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "อีเมล", type: "email" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            userRoles: {
              where: { isActive: true },
              include: { role: true },
            },
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        if (user.status === "INACTIVE") {
          throw new Error("บัญชีนี้ถูกระงับการใช้งาน");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstNameTh} ${user.lastNameTh}`,
          roles: user.userRoles.map((ur) => ur.role.roleCode),
          departmentId: user.departmentId,
        };
      },
    })
  );

  return providers;
}

export const authOptions: NextAuthOptions = {
  providers: buildProviders(),
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as { roles?: string[] }).roles ?? [];
        token.departmentId = (user as { departmentId?: number }).departmentId ?? null;
        token.mfaVerified = (user as { mfaVerified?: boolean }).mfaVerified ?? false;

        // Check MFA status from DB for admin users
        const { ROLE_LEVELS } = await import("@/lib/permissions");
        const highestLevel = Math.max(
          0,
          ...((token.roles as string[]) ?? []).map(
            (r) => ROLE_LEVELS[r as "super_admin" | "system_admin" | "dean" | "dept_admin" | "user" | "viewer"] ?? 0
          )
        );
        if (highestLevel >= 80 && !token.mfaVerified) {
          try {
            const { prisma } = await import("@/lib/prisma");
            const mfa = await prisma.userMfa.findFirst({
              where: { userId: token.id as string },
            });
            token.mfaVerified = Boolean(mfa?.isEnabled);
          } catch {
            token.mfaVerified = false;
          }
        } else {
          token.mfaVerified = true;
        }
      }
      // Google OAuth — assign viewer role for first-time Google users
      if (account?.provider === "google" && !token.roles) {
        token.roles = ["user"];
        token.mfaVerified = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { roles: string[] }).roles =
          (token.roles as string[]) ?? [];
        (session.user as { departmentId: number | null }).departmentId =
          (token.departmentId as number | null) ?? null;
        (session.user as { mfaVerified?: boolean }).mfaVerified =
          token.mfaVerified as boolean | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.SESSION_MAX_AGE) || 28800,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
