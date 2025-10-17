import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
import { applyRateLimit, loginRateLimiter } from '@/lib/rate-limit'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    provider?: string
  }
}

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env

if (!NEXTAUTH_SECRET) {
  console.warn(
    '[NextAuth] NEXTAUTH_SECRET is not set. Falling back to an insecure development secret. Set NEXTAUTH_SECRET in production.'
  )
}

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
}

const providers: NextAuthOptions['providers'] = []

// Credentials provider (email + password)
providers.push(
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      console.log('[NextAuth] authorize called with:', { email: credentials?.email })
      
      if (!credentials?.email || !credentials?.password) {
        console.error('[NextAuth] Missing credentials')
        throw new Error('Email and password are required')
      }

      // Rate limiting - prevent brute force attacks
      const rateResult = await applyRateLimit(loginRateLimiter, credentials.email)
      if (!rateResult.success) {
        console.error('[NextAuth] Rate limit exceeded for:', credentials.email)
        throw new Error('Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.')
      }

      const supabase = createClient(
        NEXT_PUBLIC_SUPABASE_URL!,
        NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error || !data.user) {
        console.error('[NextAuth] Supabase auth error:', error?.message)
        throw new Error(error?.message || 'Invalid credentials')
      }

      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        image: data.user.user_metadata?.avatar_url || null,
      }
      
      console.log('[NextAuth] User authenticated:', { id: user.id, email: user.email })
      return user
    },
  })
)

// Google OAuth provider (optional)
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    })
  )
}

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET || 'development-secret',
  debug: process.env.NODE_ENV === 'development',
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
    verifyRequest: '/auth/signin',
  },
  callbacks: {
    async signIn({ account, profile }) {
      // Credentials provider always returns true
      if (account?.provider === 'credentials') return true
      // Google OAuth: ensure verified email
      if (account?.provider === 'google') {
        const emailVerified = (profile as { email_verified?: boolean })?.email_verified
        return !!emailVerified
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        console.log('[NextAuth] JWT callback - adding user to token:', { id: user.id, email: user.email })
        token.userId = user.id as string
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }
      if (account?.provider) {
        token.provider = account.provider
      }
      console.log('[NextAuth] JWT token:', { userId: token.userId, email: token.email })
      return token
    },
    async session({ session, token }) {
      // Always set user data from token
      if (session.user && token) {
        session.user.id = (token.userId || token.sub || '') as string
        session.user.name = token.name as string | null | undefined
        session.user.email = token.email as string | null | undefined
        session.user.image = token.picture as string | null | undefined
      }
      if (token?.provider) {
        session.provider = token.provider as string
      }
      console.log('[NextAuth] Session callback - final session:', { 
        userId: session.user?.id, 
        email: session.user?.email,
        hasToken: !!token 
      })
      return session
    },
    async redirect({ baseUrl }) {
      // Always go to dashboard after login
      const dashboardUrl = new URL('/dashboard', baseUrl).toString()
      return dashboardUrl
    },
  },
}

export default NextAuth(authOptions)
