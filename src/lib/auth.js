import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongodb';
import User from '../models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
          googleId: profile.sub,
          emailVerified: new Date()
        };
      }
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          firstName: profile.name?.split(' ')[0] || profile.login,
          lastName: profile.name?.split(' ').slice(1).join(' ') || '',
          githubId: profile.id.toString(),
          emailVerified: new Date()
        };
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectDB();

          // Find user with password field included
          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

          if (!user) {
            throw new Error('No user found with this email');
          }

          // Check if user has a password (not OAuth user)
          if (!user.password) {
            throw new Error('Please sign in with your social account');
          }

          // Verify password
          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error('Please verify your email before signing in');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            emailVerified: user.emailVerified
          };
        } catch (error) {
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.emailVerified = user.emailVerified;

        if (account?.provider === 'google') {
          token.googleId = user.googleId;
        }
        if (account?.provider === 'github') {
          token.githubId = user.githubId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.emailVerified = token.emailVerified;
        session.user.googleId = token.googleId;
        session.user.githubId = token.githubId;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          await connectDB();

          // Check if user has an email
          if (!user.email) {
            console.error('OAuth user has no email address');
            return false;
          }

          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            // Update OAuth ID if not set
            if (account.provider === 'google' && !existingUser.googleId) {
              existingUser.googleId = user.googleId || profile.sub;
              existingUser.emailVerified = new Date();
              await existingUser.save();
            }
            if (account.provider === 'github' && !existingUser.githubId) {
              existingUser.githubId = user.githubId || profile.id.toString();
              existingUser.emailVerified = new Date();
              await existingUser.save();
            }

            // Update user object with database ID
            user.id = existingUser._id.toString();
          } else {
            // Create new user for OAuth
            const newUser = new User({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
              ...(account.provider === 'google' && { googleId: user.googleId || profile.sub }),
              ...(account.provider === 'github' && { githubId: user.githubId || profile.id.toString() })
            });
            const savedUser = await newUser.save();

            // Update user object with database ID
            user.id = savedUser._id.toString();
          }
        } catch (error) {
          console.error('OAuth signIn error:', error);
          return false;
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/login',
  },
  events: {
    async signIn() {
      // User signed in successfully
    },
    async signOut() {
      // User signed out successfully
    }
  },
});
