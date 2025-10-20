"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type InvestingContentProps = {
  isAuthenticated: boolean
}

type SubCategory = {
  icon: string
  title: string
  description: string
  dashboardHref?: string
  isActive: boolean
  comingSoon?: boolean
}

const subCategories: SubCategory[] = [
  {
    icon: "📊",
    title: "Crypto Risk Assessment",
    description: "Değerlendir ve portföy riskini analiz et",
    dashboardHref: "/investing/crypto-assessment",
    isActive: true,
  },
  {
    icon: "💹",
    title: "Portfolio Analyzer",
    description: "Portföy performans analizi",
    isActive: false,
    comingSoon: true,
  },
  {
    icon: "📈",
    title: "Market Insights",
    description: "Piyasa trendleri ve öneriler",
    isActive: false,
    comingSoon: true,
  },
  {
    icon: "🎯",
    title: "Investment Goals",
    description: "Hedef bazlı yatırım planı",
    isActive: false,
    comingSoon: true,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
}

export function InvestingContent({ isAuthenticated }: InvestingContentProps) {
  return (
    <div className="bg-background text-text-primary">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 md:px-6">
        <div className="mb-8 flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/" className="transition hover:text-text-primary">
            Home
          </Link>
          <span className="text-text-secondary/70">›</span>
          <span className="text-investing">Investing</span>
        </div>

        {!isAuthenticated && (
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-investing/40 bg-investing-soft/70 px-6 py-5 text-sm text-investing md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-investing">Sign up to track your portfolio</p>
              <p className="text-investing/80">
                Kaydolduğunuzda yatırım planlarınızı kaydedip istediğiniz yerde erişebilirsiniz.
              </p>
            </div>
            <Button
              asChild
              className="bg-investing px-6 py-2 text-background hover:bg-investing/90"
            >
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        )}

        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-text-primary md:text-5xl">💰 Investing Intelligence</h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Kripto risk değerlendirmesi yapın, portföy analizi gerçekleştirin ve akıllı yatırım kararları alın.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {subCategories.map((subCategory) => {
            const rawHref = (subCategory as { href?: unknown }).href;
            const href = typeof rawHref === "string" ? rawHref : undefined;
            const isComingSoon = Boolean((subCategory as { comingSoon?: boolean }).comingSoon);
            const isInteractive = subCategory.isActive && href;

            return (
              <motion.div key={subCategory.title} variants={cardVariants}>
                {isInteractive ? (
                  <Link href={href!} className="block h-full">
                    <Card className="h-full border border-investing/30 bg-card shadow-sm shadow-surface-muted/40 transition duration-300 hover:-translate-y-1 hover:border-investing hover:shadow-lg">
                      <CardContent className="flex h-full flex-col gap-6 p-8">
                        <div className="text-5xl">{subCategory.icon}</div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-semibold text-text-primary">{subCategory.title}</h3>
                          <p className="text-base text-text-secondary">{subCategory.description}</p>
                        </div>
                        <Button className="mt-auto w-full bg-investing text-background hover:bg-investing/90">
                          Başla →
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="h-full border border-border/60 bg-surface-muted/80 shadow-sm">
                    <CardContent className="relative flex h-full flex-col gap-6 p-8 text-center">
                      {isComingSoon && (
                        <Badge
                          variant="outline"
                          className="absolute right-6 top-6 border-investing/40 bg-investing-soft/70 text-investing"
                        >
                          Yakında
                        </Badge>
                      )}
                      <div className="text-5xl">{subCategory.icon}</div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-semibold text-text-primary">{subCategory.title}</h3>
                        <p className="text-base text-text-secondary">{subCategory.description}</p>
                      </div>
                      <p className="mt-auto text-sm text-text-secondary">
                        Yeni özellikler için topluluğa katılın.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  )
}
