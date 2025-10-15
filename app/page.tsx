"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    icon: "💪",
    title: "Sport",
    description: "Workout plans & nutrition",
    href: "/sport",
    isActive: true,
  },
  {
    icon: "🍳",
    title: "Food",
    description: "Recipe generation & meal planning",
    href: null,
    isActive: false,
  },
  {
    icon: "💼",
    title: "Business",
    description: "Professional tools & insights",
    href: null,
    isActive: false,
  },
  {
    icon: "📚",
    title: "Education",
    description: "Learning resources & tutorials",
    href: null,
    isActive: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
      transition: {
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 1],
      },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold text-white mb-4"
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              AI
            </span>{" "}
            at your fingertips
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            No prompts needed, just tap and go
          </motion.p>
        </div>

        {/* Category Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {categories.map((category) => (
            <motion.div key={category.title} variants={cardVariants}>
              {category.isActive ? (
                <Link href={category.href!}>
                  <Card className="h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-slate-700/50 border-slate-600 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4">{category.icon}</div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="h-full bg-slate-700/30 border-slate-600 backdrop-blur-sm opacity-60">
                  <CardContent className="p-6 text-center relative">
                    <div className="absolute top-2 right-2">
                      <span className="bg-gray-500 text-gray-200 text-xs px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {category.description}
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
