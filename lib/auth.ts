import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      console.log(`发送密码重置邮件到 ${user.email}: ${url}`);
    },
  },
  session: {
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 30 * 24 * 60 * 60,
    },
  },
  advanced: {
    cookiePrefix: "pooplet",
    useSecureCookies: false,
    cookies: {
      session_token: {
        name: "pooplet_session_token",
        attributes: {
          secure: false,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          domain: undefined,
        },
      },
      session_data: {
        name: "pooplet_session_data",
        attributes: {
          secure: false,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          domain: undefined,
        },
      },
    },
  },
});
