import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './prisma.js';

const trustedOrigins =
  process.env.TRUSTED_ORIGINS?.split(',').map(o => o.trim()) || [];

export const auth = betterAuth({
  /* ---------------- DATABASE ---------------- */
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  /* ---------------- AUTH METHODS ---------------- */
  emailAndPassword: {
    enabled: true,
  },

  user: {
    deleteUser: { enabled: true },
  },

  /* ---------------- SECURITY ---------------- */
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins,

  /* ---------------- EVENTS ---------------- */
  events: {
  async userCreated(event: { user: { id: string } }) {
    const userId = event.user.id;

    console.log('🔥 userCreated fired:', userId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: 20,
        totalCreation: 0,
      },
    });

    console.log('✅ Credits initialized for user:', userId);
  },
},


  /* ---------------- COOKIES ---------------- */
  advanced: {
    cookies: {
      session_token: {
        name: 'auth_session',
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite:
            process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/',
        },
      },
    },
  },
});
