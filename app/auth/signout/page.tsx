"use client"

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignOutPage() {
  const [loading, setLoading] = useState(false)

  async function onSignOut() {
    setLoading(true)
    try {
      await signOut({ callbackUrl: '/' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>Are you sure you want to sign out?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={onSignOut} className="w-full" disabled={loading}>
            {loading ? 'Signing out…' : 'Sign out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


