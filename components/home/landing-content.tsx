"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import clsx from "clsx"

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

const CATEGORY_STYLES: Record<
  string,
  {
    cardBg: string
    cardBorder: string
    title: string
    link: string
    badgeBg: string
    badgeBorder: string
    badgeText: string
  }
> = {
  Sport: {
    cardBg: "bg-sport-soft/70",
    cardBorder: "border-sport/40",
    title: "text-sport",
    link: "text-sport",
    badgeBg: "bg-sport-soft",
    badgeBorder: "border-sport/40",
    badgeText: "text-sport",
  },
  Investing: {
    cardBg: "bg-investing-soft/70",
    cardBorder: "border-investing/40",
    title: "text-investing",
    link: "text-investing",
    badgeBg: "bg-investing-soft",
    badgeBorder: "border-investing/40",
    badgeText: "text-investing",
  },
  "Social Media": {
    cardBg: "bg-purple-50/70",
    cardBorder: "border-purple-400/40",
    title: "text-purple-600",
    link: "text-purple-600",
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-400/40",
    badgeText: "text-purple-600",
  },
  Food: {
    cardBg: "bg-surface-muted/80",
    cardBorder: "border-border/60",
    title: "text-text-primary",
    link: "text-text-secondary",
    badgeBg: "bg-surface-muted",
    badgeBorder: "border-border",
    badgeText: "text-text-secondary",
  },
  Business: {
    cardBg: "bg-business-soft/70",
    cardBorder: "border-business/40",
    title: "text-business",
    link: "text-business",
    badgeBg: "bg-business-soft",
    badgeBorder: "border-business/40",
    badgeText: "text-business",
  },
  Education: {
    cardBg: "bg-education-soft/70",
    cardBorder: "border-education/40",
    title: "text-education",
    link: "text-education",
    badgeBg: "bg-education-soft",
    badgeBorder: "border-education/40",
    badgeText: "text-education",
  },
}

const categories: Category[] = [
  {
    icon: "💪",
    title: "Sport",
    description: "Tailored workout plans, coaching, and wellness tools.",
    dashboardHref: "/sport",
    isActive: true,
  },
  {
    icon: "💰",
    title: "Investing",
    description: "Crypto risk assessment and portfolio analysis tools.",
    dashboardHref: "/investing",
    isActive: true,
  },
  {
    icon: "🎨",
    title: "Social Media",
    description: "AI görsel dönüşümü ve stil transferi araçları.",
    dashboardHref: "/dashboard/social-media",
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
    <div className="relative isolate overflow-hidden bg-background text-text-primary">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.22),_transparent_65%)]" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 md:px-6 md:pb-32 md:pt-28">
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          <span className="inline-flex items-center rounded-full border border-business/30 bg-business-soft/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-business">
            AI Trainer For Humans
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-text-primary md:text-6xl">
            AI at your fingertips
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary md:text-xl">
            No prompts needed, just tap and go. Build plans, track progress, and let AI move with you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  className="px-8 py-6 text-lg font-semibold shadow-md shadow-surface-muted/60 hover:shadow-lg"
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
                  className="px-8 py-6 text-lg font-semibold shadow-md shadow-surface-muted/60 hover:shadow-lg"
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
            const visual = CATEGORY_STYLES[category.title] ?? {
              cardBg: "bg-card/90",
              cardBorder: "border-border/60",
              title: "text-text-primary",
              link: "text-link",
              badgeBg: "bg-surface-muted",
              badgeBorder: "border-border",
              badgeText: "text-text-secondary",
            }

            return (
              <motion.div key={category.title} variants={cardVariants}>
              <Card
                className={clsx(
                  "group h-full border backdrop-blur-sm shadow-sm shadow-surface-muted/40 transition hover:shadow-md",
                  visual.cardBg,
                  visual.cardBorder
                )}
              >
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{category.icon}</span>
                    {!category.isActive && category.comingSoon && (
                      <Badge
                        variant="outline"
                        className={clsx(
                          "border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                          visual.badgeBorder,
                          visual.badgeBg,
                          visual.badgeText
                        )}
                      >
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className={clsx("text-xl font-semibold", visual.title)}>{category.title}</h3>
                    <p className="text-sm text-text-secondary">{category.description}</p>
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
                        className={clsx(
                          "text-sm font-medium transition hover:opacity-80",
                          visual.link
                        )}
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
