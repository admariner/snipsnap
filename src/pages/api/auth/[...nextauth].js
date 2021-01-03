import { PrismaClient } from '@prisma/client';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

// Change it to default prisma adapter once it's fixed
// https://github.com/nextauthjs/next-auth/issues/683
import Adapter from 'db/prisma/prisma-next-auth-adapter';
import jwt from 'utils/jwt';

const prisma = new PrismaClient();
const options = {
  // TODO Create branded pages for autogenerated pages
  pages: {
    signIn: '/login',
  },
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  adapter: Adapter({ prisma }),
  session: {
    jwt: true,
  },
  jwt: {
    encode: async ({ token }) => jwt.encode({ token }),
    decode: async ({ token }) => jwt.decode({ token }),
  },
  callbacks: {
    session: async (session, user) => {
      const encodedToken = jwt.encode({ token: user });
      session.id = user.id;
      session.token = encodedToken;
      return Promise.resolve(session);
    },
    jwt: async (token, user, account, profile, isNewUser) => {
      const isSignIn = !!user;
      if (isSignIn) {
        token.id = user.userId;
      }
      return Promise.resolve(token);
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
