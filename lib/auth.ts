import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { nextCookies } from "better-auth/next-js";

const isProduction = process.env.NODE_ENV === 'production';
const isSecureRequired = isProduction && process.env.BETTER_AUTH_SECURE === 'true';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`发送密码重置邮件到 ${user.email}: ${url}`);
      }
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
    useSecureCookies: isSecureRequired,
    cookies: {
      session_token: {
        name: "pooplet_session_token",
        attributes: {
          secure: isSecureRequired,
          httpOnly: true,
          sameSite: isSecureRequired ? "strict" : "lax",
          path: "/",
        },
      },
      session_data: {
        name: "pooplet_session_data",
        attributes: {
          secure: isSecureRequired,
          httpOnly: true,
          sameSite: isSecureRequired ? "strict" : "lax",
          path: "/",
        },
      },
    },
  },
});
