"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")

  async function onEmailSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const toastId = toast.loading("Giriş yapılıyor...")
    
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        // Check if error is due to unconfirmed email
        if (res.error === "Email not confirmed" || res.error === "Email not verified") {
          toast.error("📧 Email adresinizi onaylamalısınız", { 
            id: toastId,
            description: "Giriş yapabilmek için önce emailinizi onaylayın.",
            duration: 8000
          })
        } else {
          toast.error("❌ Email veya şifre hatalı", { id: toastId })
        }
        setError("Invalid email or password")
        setLoading(false)
      } else if (res?.ok) {
        toast.success("✅ Giriş başarılı! Hoş geldiniz", { id: toastId })
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 800)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password"
      toast.error("❌ Giriş başarısız", { id: toastId })
      setError(errorMessage)
      setLoading(false)
    }
  }

  async function onGoogle() {
    setError(null)
    setLoading(true)
    toast.loading("Google ile giriş yapılıyor...")
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Google sign-in failed"
      toast.error("Google ile giriş başarısız")
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border border-border bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-text-primary">Sign in</CardTitle>
        <CardDescription className="text-sm text-text-secondary">
          Welcome back! Enter your credentials or continue with Google.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorParam && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{decodeURIComponent(errorParam)}</div>}
        {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

        <form onSubmit={onEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-text-secondary">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface-muted/60 focus-visible:ring-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-text-secondary">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-muted/60 focus-visible:ring-ring"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="relative py-2 text-center">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          <span className="relative bg-card px-3 text-xs uppercase tracking-wide text-text-secondary/80">Or continue with</span>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={loading}>
          Sign in with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/auth/signup" className="text-link hover:text-link-hover">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
