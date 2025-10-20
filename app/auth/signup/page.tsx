import Link from 'next/link'
import { Suspense } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { SignUpForm } from './signup-form'

export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-text-primary">
            <Link href="/">← Back to Home</Link>
          </Button>
          <span className="text-sm text-muted-foreground md:text-right">
            Join 1000+ athletes training smarter with Ceku.ai.
          </span>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1fr),420px] md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-investing/30 bg-investing-soft/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-investing">
              Get Started
            </span>
            <h1 className="text-4xl font-bold text-text-primary md:text-5xl">
              Create your account and start training
            </h1>
            <p className="text-lg text-muted-foreground">
              Join thousands of athletes who are achieving their fitness goals with AI-powered workout plans.
            </p>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-business" />
                Personalized workout plans for your goals.
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-education" />
                Track progress and see real results.
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-investing" />
                AI-powered insights to optimize your training.
              </div>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12 text-sm text-muted-foreground shadow-sm">
                Loading sign up form...
              </div>
            }
          >
            <SignUpForm />
          </Suspense>
        </div>
      </div>
    </PublicLayout>
  )
}
