"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@supabase/supabase-js"

export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!accepted) {
      toast.error("Şartları kabul etmelisiniz")
      setError("You must accept the terms to continue")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor")
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı")
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    const toastId = toast.loading("Hesap oluşturuluyor...")
    
    try {
      // Create user in Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        toast.error(`Kayıt başarısız: ${signUpError.message}`, { id: toastId })
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        toast.error("Hesap oluşturulamadı", { id: toastId })
        setError("Failed to create account")
        setLoading(false)
        return
      }

      // Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Failed to create profile:', profileError)
        // Don't fail the sign-up if profile creation fails, but log it
        toast.error("Hesap oluşturuldu ancak profil oluşturulamadı", { id: toastId })
      }

      // Check if email confirmation is required
      if (data.user.email_confirmed_at === null) {
        toast.success("✅ Hesabınız oluşturuldu! 📧", {
          id: toastId,
          description: "Lütfen email kutunuzu kontrol edin.",
          duration: 8000
        })
        
        toast.info("⚠️ Email onayı gerekli", {
          description: "Giriş yapabilmek için emailinizi onaylamanız gerekiyor. Spam klasörünü de kontrol edin.",
          duration: 10000
        })
        
        // Redirect to verify email page
        setTimeout(() => {
          window.location.href = "/auth/verify-email"
        }, 2000)
      } else {
        // Email already confirmed, redirect to dashboard
        toast.success("✅ Hesabınız oluşturuldu! Yönlendiriliyorsunuz...", { id: toastId })
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account"
      toast.error(`Bir hata oluştu: ${errorMessage}`, { id: toastId })
      setError(errorMessage)
      setLoading(false)
    }
  }

  async function onGoogle() {
    if (!accepted) {
      toast.error("Şartları kabul etmelisiniz")
      setError("You must accept the terms to continue")
      return
    }
    setError(null)
    setLoading(true)
    toast.loading("Google ile giriş yapılıyor...")
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Google sign-up failed"
      toast.error("Google ile giriş başarısız")
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border border-border bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-text-primary">Create account</CardTitle>
        <CardDescription className="text-sm text-text-secondary">
          Start your fitness journey with personalized AI-powered plans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

        <form onSubmit={onSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-text-secondary">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-surface-muted/60 focus-visible:ring-ring"
              required
            />
          </div>
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
              autoComplete="new-password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-muted/60 focus-visible:ring-ring"
              required
            />
            <p className="text-xs text-text-secondary/80">Minimum 8 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-text-secondary">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-surface-muted/60 focus-visible:ring-ring"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(!!v)}
            />
            <Label htmlFor="terms" className="text-sm text-text-secondary">
              I agree to the{" "}
              <Link href="/terms" className="text-link hover:text-link-hover">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-link hover:text-link-hover">
                Privacy Policy
              </Link>
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="relative py-2 text-center">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          <span className="relative bg-card px-3 text-xs uppercase tracking-wide text-text-secondary/80">Or continue with</span>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={loading}>
          Sign up with Google
        </Button>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-link hover:text-link-hover">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
