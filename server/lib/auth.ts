import 'dotenv/config'
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',') || [];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    deleteUser: { enabled: true },
  },

  trustedOrigins,
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,

  /** 🔑 THIS IS THE FIX */
  events: {
  async userCreated({ user }: { user: { id: string } }) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: 20,
        totalCreation: 0,
      },
    });
  },
},


  advanced: {
    cookies: {
      session_token: {
        name: 'auth_session',
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/',
        },
      },
    },
  },
});
