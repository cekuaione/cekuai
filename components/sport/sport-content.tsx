"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type SportContentProps = {
  isAuthenticated: boolean
}

type SubCategory = {
  icon: string
  title: string
  description: string
  href: string | null
  isActive: boolean
  comingSoon?: boolean
}

const subCategories: SubCategory[] = [
  {
    icon: "🏋️",
    title: "Egzersiz Programı",
    description: "Kişiselleştirilmiş antrenman planı",
    href: "/sport/workout-plan",
    isActive: true,
  },
  {
    icon: "🥗",
    title: "Diyet Programı",
    description: "Beslenme ve kalori planı",
    href: null,
    isActive: false,
    comingSoon: true,
  },
  {
    icon: "⚽",
    title: "Takım & Sporcu Haberleri",
    description: "Favori takımlarınızdan haberler",
    href: null,
    isActive: false,
    comingSoon: true,
  },
  {
    icon: "🛒",
    title: "Ekipman Fiyatları",
    description: "En iyi fiyatları bul",
    href: null,
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

export function SportContent({ isAuthenticated }: SportContentProps) {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 md:px-6">
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <span className="text-muted-foreground/70">›</span>
          <span className="text-white/80">Sport</span>
        </div>

        {!isAuthenticated && (
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-5 text-sm text-blue-100 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-blue-200">Sign up to save your plans</p>
              <p className="text-blue-200/80">
                Kaydolduğunuzda hazırladığınız antrenman planlarını kaydedip istediğiniz yerde erişebilirsiniz.
              </p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
            >
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        )}

        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold md:text-5xl">💪 Sport Intelligence</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Hedeflerinize uygun antrenman planları oluşturun, ilerlemenizi takip edin ve AI destekli koçluk alın.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {subCategories.map((subCategory) => (
            <motion.div key={subCategory.title} variants={cardVariants}>
              {subCategory.isActive && subCategory.href ? (
                <Link href={subCategory.href} className="block h-full">
                  <Card className="h-full border border-white/10 bg-white/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl">
                    <CardContent className="flex h-full flex-col gap-6 p-8">
                      <div className="text-5xl">{subCategory.icon}</div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-semibold text-white">{subCategory.title}</h3>
                        <p className="text-base text-muted-foreground">{subCategory.description}</p>
                      </div>
                      <Button className="mt-auto w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                        Planı Oluştur →
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="h-full border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                  <CardContent className="relative flex h-full flex-col gap-6 p-8 text-center">
                    {subCategory.comingSoon && (
                      <Badge
                        variant="outline"
                        className="absolute right-6 top-6 border-blue-500/40 bg-blue-500/10 text-blue-300"
                      >
                        Yakında
                      </Badge>
                    )}
                    <div className="text-5xl">{subCategory.icon}</div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold text-white">{subCategory.title}</h3>
                      <p className="text-base text-muted-foreground">{subCategory.description}</p>
                    </div>
                    <p className="mt-auto text-sm text-muted-foreground">
                      Yeni özellikler için topluluğa katılın.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
