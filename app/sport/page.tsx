"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const subCategories = [
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
  },
  {
    icon: "⚽",
    title: "Takım & Sporcu Haberleri",
    description: "Favori takımlarınızdan haberler",
    href: null,
    isActive: false,
  },
  {
    icon: "🛒",
    title: "Ekipman Fiyatları",
    description: "En iyi fiyatları bul",
    href: null,
    isActive: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function SportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-400">
            Home
          </Link>
          <span className="text-sm text-gray-500 mx-2">›</span>
          <span className="text-sm text-gray-400">Sport</span>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            💪 Sport
          </h1>
          <p className="text-lg text-gray-400">
            Choose your fitness goal
          </p>
        </div>

        {/* Sub-category Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {subCategories.map((subCategory) => (
            <motion.div key={subCategory.title} variants={cardVariants}>
              {subCategory.isActive ? (
                <Link href={subCategory.href!}>
                  <Card className="h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-slate-700/50 border-slate-600 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-6">{subCategory.icon}</div>
                      <h3 className="text-2xl font-semibold text-white mb-4">
                        {subCategory.title}
                      </h3>
                      <p className="text-gray-300 text-lg mb-6">
                        {subCategory.description}
                      </p>
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 text-lg">
                        Başla →
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="h-full bg-slate-700/30 border-slate-600 backdrop-blur-sm opacity-60">
                  <CardContent className="p-8 text-center relative">
                    <div className="absolute top-4 right-4">
                      <span className="bg-gray-500 text-gray-200 text-sm px-3 py-1 rounded-full">
                        Yakında
                      </span>
                    </div>
                    <div className="text-6xl mb-6">{subCategory.icon}</div>
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      {subCategory.title}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      {subCategory.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

console.log("✅ Sport page ready");
