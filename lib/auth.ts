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
  console.warn(
    '[NextAuth] Supabase environment variables are not fully configured. The app will fail at runtime without NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  )
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

      if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase environment variables are not configured.')
      }

      const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error || !data.user) {
        console.error('[NextAuth] Supabase auth error:', error?.message)
        throw new Error(error?.message || 'Invalid credentials')
      }

      // Ensure profile exists for credentials users
      try {
        const serviceSupabase = createClient(NEXT_PUBLIC_SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
        
        // Check if profile exists
        const { data: existingProfile } = await serviceSupabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()
        
        if (!existingProfile) {
          // Create profile for credentials user
          const { error: profileError } = await serviceSupabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || null,
              avatar_url: data.user.user_metadata?.avatar_url || null,
              created_at: data.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          
          if (profileError) {
            console.error('Failed to create profile for credentials user:', profileError)
          } else {
            console.log('Created profile for credentials user:', data.user.id)
          }
        }
      } catch (error) {
        console.error('Error ensuring profile for credentials user:', error)
        // Don't fail authentication
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
    async signIn({ account, profile, user }) {
      // Credentials provider always returns true
      if (account?.provider === 'credentials') return true
      
      // Google OAuth: ensure verified email and create profile
      if (account?.provider === 'google') {
        const emailVerified = (profile as { email_verified?: boolean })?.email_verified
        if (!emailVerified) return false
        
        // Create profile for Google OAuth users
        if (user?.id) {
          try {
            const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
            
            // Check if profile already exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .single()
            
            if (!existingProfile) {
              // Create new profile
              const { error } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  full_name: (profile as { name?: string })?.name || user.email?.split('@')[0] || null,
                  avatar_url: (profile as { picture?: string })?.picture || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
              
              if (error) {
                console.error('Failed to create profile for Google user:', error)
                // Don't fail sign-in, but log the error
              } else {
                console.log('Created profile for Google user:', user.id)
              }
            }
          } catch (error) {
            console.error('Error creating profile for Google user:', error)
            // Don't fail sign-in
          }
        }
        
        return true
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
