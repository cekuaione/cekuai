"use client"

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const message = useMemo(() => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. Please try a different account.'
      case 'Verification':
        return 'The sign-in link is invalid or has expired.'
      case 'OAuthAccountNotLinked':
        return 'This email is already linked with another provider.'
      default:
        return error ? decodeURIComponent(error) : 'An unknown error occurred.'
    }
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication error</CardTitle>
          <CardDescription>We couldn&apos;t complete your request.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-red-600">{message}</p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/auth/signin">Try again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}


