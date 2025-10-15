"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const mockUserData = {
  goal: "Kas Yapma",
  level: "Yeni Başlayan",
  daysPerWeek: "3 gün/hafta",
  duration: "60 dk/gün",
  equipment: ["Dambıl", "Barbell"],
};

const mockWorkoutPlan = {
  "Hafta 1": {
    "Pazartesi": {
      title: "Pazartesi - Üst Vücut",
      exercises: [
        { name: "Bench Press", sets: "3 x 10", rest: "90 saniye", target: "Göğüs, Omuz" },
        { name: "Shoulder Press", sets: "3 x 12", rest: "60 saniye", target: "Omuz" },
        { name: "Tricep Dips", sets: "3 x 15", rest: "45 saniye", target: "Triceps" },
      ]
    },
    "Çarşamba": {
      title: "Çarşamba - Alt Vücut",
      exercises: [
        { name: "Squats", sets: "3 x 10", rest: "90 saniye", target: "Bacak, Kalça" },
        { name: "Lunges", sets: "3 x 12", rest: "60 saniye", target: "Bacak" },
        { name: "Calf Raises", sets: "3 x 15", rest: "45 saniye", target: "Baldır" },
      ]
    },
    "Cuma": {
      title: "Cuma - Sırt & Kol",
      exercises: [
        { name: "Pull-ups", sets: "3 x 8", rest: "90 saniye", target: "Sırt, Biceps" },
        { name: "Rows", sets: "3 x 10", rest: "60 saniye", target: "Sırt" },
        { name: "Bicep Curls", sets: "3 x 12", rest: "45 saniye", target: "Biceps" },
      ]
    }
  },
  "Hafta 2": {
    "Pazartesi": {
      title: "Pazartesi - Üst Vücut (Gelişmiş)",
      exercises: [
        { name: "Incline Bench Press", sets: "3 x 8", rest: "90 saniye", target: "Göğüs, Omuz" },
        { name: "Lateral Raises", sets: "3 x 15", rest: "60 saniye", target: "Omuz" },
        { name: "Close Grip Bench Press", sets: "3 x 12", rest: "45 saniye", target: "Triceps" },
      ]
    },
    "Çarşamba": {
      title: "Çarşamba - Alt Vücut (Gelişmiş)",
      exercises: [
        { name: "Bulgarian Split Squats", sets: "3 x 10", rest: "90 saniye", target: "Bacak, Kalça" },
        { name: "Romanian Deadlifts", sets: "3 x 12", rest: "60 saniye", target: "Hamstring, Kalça" },
        { name: "Single Leg Calf Raises", sets: "3 x 15", rest: "45 saniye", target: "Baldır" },
      ]
    },
    "Cuma": {
      title: "Cuma - Sırt & Kol (Gelişmiş)",
      exercises: [
        { name: "Weighted Pull-ups", sets: "3 x 6", rest: "90 saniye", target: "Sırt, Biceps" },
        { name: "T-Bar Rows", sets: "3 x 10", rest: "60 saniye", target: "Sırt" },
        { name: "Hammer Curls", sets: "3 x 12", rest: "45 saniye", target: "Biceps" },
      ]
    }
  },
  "Hafta 3": {
    "Pazartesi": {
      title: "Pazartesi - Üst Vücut (Yoğun)",
      exercises: [
        { name: "Decline Bench Press", sets: "3 x 8", rest: "90 saniye", target: "Göğüs" },
        { name: "Arnold Press", sets: "3 x 10", rest: "60 saniye", target: "Omuz" },
        { name: "Diamond Push-ups", sets: "3 x 15", rest: "45 saniye", target: "Triceps" },
      ]
    },
    "Çarşamba": {
      title: "Çarşamba - Alt Vücut (Yoğun)",
      exercises: [
        { name: "Front Squats", sets: "3 x 8", rest: "90 saniye", target: "Bacak, Core" },
        { name: "Walking Lunges", sets: "3 x 12", rest: "60 saniye", target: "Bacak" },
        { name: "Jump Squats", sets: "3 x 15", rest: "45 saniye", target: "Bacak, Kardio" },
      ]
    },
    "Cuma": {
      title: "Cuma - Sırt & Kol (Yoğun)",
      exercises: [
        { name: "Wide Grip Pull-ups", sets: "3 x 6", rest: "90 saniye", target: "Sırt" },
        { name: "Face Pulls", sets: "3 x 15", rest: "60 saniye", target: "Omuz, Sırt" },
        { name: "21s Bicep Curls", sets: "3 x 21", rest: "45 saniye", target: "Biceps" },
      ]
    }
  },
  "Hafta 4": {
    "Pazartesi": {
      title: "Pazartesi - Üst Vücut (Maksimum)",
      exercises: [
        { name: "Heavy Bench Press", sets: "4 x 6", rest: "120 saniye", target: "Göğüs, Omuz" },
        { name: "Overhead Press", sets: "4 x 8", rest: "90 saniye", target: "Omuz" },
        { name: "Weighted Dips", sets: "3 x 10", rest: "60 saniye", target: "Triceps" },
      ]
    },
    "Çarşamba": {
      title: "Çarşamba - Alt Vücut (Maksimum)",
      exercises: [
        { name: "Heavy Squats", sets: "4 x 6", rest: "120 saniye", target: "Bacak, Kalça" },
        { name: "Deadlifts", sets: "4 x 8", rest: "90 saniye", target: "Tüm Vücut" },
        { name: "Weighted Calf Raises", sets: "4 x 12", rest: "60 saniye", target: "Baldır" },
      ]
    },
    "Cuma": {
      title: "Cuma - Sırt & Kol (Maksimum)",
      exercises: [
        { name: "Weighted Pull-ups", sets: "4 x 6", rest: "120 saniye", target: "Sırt, Biceps" },
        { name: "Barbell Rows", sets: "4 x 8", rest: "90 saniye", target: "Sırt" },
        { name: "Preacher Curls", sets: "4 x 10", rest: "60 saniye", target: "Biceps" },
      ]
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
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
      ease: "easeOut",
    },
  },
};

export default function WorkoutResultPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-400">
              Home
            </Link>
            <span className="text-sm text-gray-500 mx-2">›</span>
            <Link href="/sport" className="text-sm text-gray-500 hover:text-gray-400">
              Sport
            </Link>
            <span className="text-sm text-gray-500 mx-2">›</span>
            <Link href="/sport/workout-plan" className="text-sm text-gray-500 hover:text-gray-400">
              Egzersiz Programı
            </Link>
            <span className="text-sm text-gray-500 mx-2">›</span>
            <span className="text-sm text-gray-400">Plan</span>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-4">
              ✅ Planınız Hazır!
            </h1>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto space-y-8"
          >
            {/* Summary Card */}
            <motion.div variants={cardVariants}>
              <Card className="bg-white rounded-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800 text-center">
                    📋 Program Özeti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700">Hedef:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          💪 {mockUserData.goal}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700">Seviye:</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          🌱 {mockUserData.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700">Program:</span>
                        <span className="text-gray-600">{mockUserData.daysPerWeek}, {mockUserData.duration}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700">Ekipman:</span>
                        <div className="flex gap-1">
                          {mockUserData.equipment.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weekly Plan */}
            <motion.div variants={cardVariants}>
              <Card className="bg-slate-700/50 border-slate-600 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white text-center">
                    📅 4 Haftalık Program
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="Hafta 1" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-600">
                      {Object.keys(mockWorkoutPlan).map((week) => (
                        <TabsTrigger key={week} value={week} className="text-white data-[state=active]:bg-blue-600">
                          {week}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {Object.entries(mockWorkoutPlan).map(([week, days]) => (
                      <TabsContent key={week} value={week} className="space-y-6 mt-6">
                        {Object.entries(days).map(([day, workout]) => (
                          <Card key={day} className="bg-slate-600/50 border-slate-500">
                            <CardHeader>
                              <CardTitle className="text-xl text-white">
                                {workout.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {workout.exercises.map((exercise, index) => (
                                  <div key={index} className="bg-slate-500/30 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-semibold text-white">{exercise.name}</h4>
                                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                                        {exercise.target}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300">
                                      <span>Sets: <strong>{exercise.sets}</strong></span>
                                      <span>Dinlenme: <strong>{exercise.rest}</strong></span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={cardVariants} className="flex justify-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" disabled className="border-slate-600 text-gray-400">
                    📥 PDF İndir
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Yakında</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" disabled className="border-slate-600 text-gray-400">
                    🔗 Paylaş
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Yakında</p>
                </TooltipContent>
              </Tooltip>

              <Link href="/sport/workout-plan">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  🔄 Yeni Plan Oluştur
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}

console.log("✅ Result page ready");
