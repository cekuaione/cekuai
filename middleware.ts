import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Require a valid session token for protected routes
        return !!token
      },
    },
  }
)

// Only run middleware on protected routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/workout/:path*',
    '/api/openai/:path*',
  ],
}


