import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      departmentId: number | null;
      mfaVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    roles?: string[];
    departmentId?: number;
    mfaVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: string[];
    departmentId: number | null;
    mfaVerified?: boolean;
  }
}
