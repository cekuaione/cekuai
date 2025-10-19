"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type LandingContentProps = {
  isAuthenticated: boolean
}

type Category = {
  icon: string
  title: string
  description: string
  dashboardHref?: string
  isActive: boolean
  comingSoon?: boolean
}

const categories: Category[] = [
  {
    icon: "💪",
    title: "Sport",
    description: "Tailored workout plans, coaching, and wellness tools.",
    dashboardHref: "/dashboard/sport/workout-plan",
    isActive: true,
  },
  {
    icon: "🍳",
    title: "Food",
    description: "Recipe generation, meal planning, and nutrition insights.",
    isActive: false,
    comingSoon: true,
  },
  {
    icon: "💼",
    title: "Business",
    description: "AI workflows for your team and business decisions.",
    isActive: false,
    comingSoon: true,
  },
  {
    icon: "📚",
    title: "Education",
    description: "Learning resources, study plans, and tutoring support.",
    isActive: false,
    comingSoon: true,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
}

export function LandingContent({ isAuthenticated }: LandingContentProps) {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 md:px-6 md:pb-32 md:pt-28">
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          <span className="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            AI Trainer For Humans
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
            AI at your fingertips
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
            No prompts needed, just tap and go. Build plans, track progress, and let AI move with you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-lg font-semibold shadow-lg transition hover:from-blue-600 hover:to-purple-700"
                >
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="px-8 py-6 text-lg">
                  <a href="#features">Explore Features</a>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-lg font-semibold shadow-lg transition hover:from-blue-600 hover:to-purple-700"
                >
                  <Link href="/auth/signup">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" className="px-8 py-6 text-lg">
                  <a href="#features">Explore Features</a>
                </Button>
              </>
            )}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Join 1000+ athletes and creators using Ceku.ai for smarter training.
          </p>
        </motion.section>

        <motion.section
          id="features"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 xl:mt-24 xl:grid-cols-4"
        >
          {categories.map((category) => {
            const activeHref =
              category.isActive && category.dashboardHref
                ? isAuthenticated
                  ? category.dashboardHref
                  : `/auth/login?redirect=${encodeURIComponent(category.dashboardHref)}`
                : null;

            return (
              <motion.div key={category.title} variants={cardVariants}>
              <Card className="group h-full border border-white/10 bg-white/5 backdrop-blur-sm transition hover:border-blue-500/50">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{category.icon}</span>
                    {!category.isActive && category.comingSoon && (
                      <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-300">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    {activeHref ? (
                      <Button asChild variant="secondary" className="px-4">
                        <Link href={activeHref}>Open</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="cursor-not-allowed px-4 text-muted-foreground" disabled>
                        Locked
                      </Button>
                    )}
                    {activeHref ? (
                      <Link
                        href={activeHref}
                        className="text-sm font-medium text-blue-300 transition hover:text-blue-100"
                      >
                        View All →
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">Stay tuned</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            );
          })}
        </motion.section>
      </div>
    </div>
  )
}
