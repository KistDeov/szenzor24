import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends DefaultUser {
    licence?: string;
    trialEnded?: boolean;
  }
  interface Session {
    user: {
      id?: string;
      licence?: string;
      trialEnded?: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    licence?: string;
    trialEnded?: boolean;
  }
}
