"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  goal: z.string().min(1, "Hedef seçiniz"),
  level: z.string().min(1, "Seviye seçiniz"),
  daysPerWeek: z.string().min(1, "Haftalık gün sayısı seçiniz"),
  duration: z.string().min(1, "Süre seçiniz"),
  equipment: z.array(z.string()).min(1, "En az bir ekipman seçiniz"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const goals = [
  { value: "muscle", label: "💪 Kas Yapma" },
  { value: "weight_loss", label: "🔥 Kilo Verme" },
  { value: "endurance", label: "⚡ Dayanıklılık" },
  { value: "general", label: "💯 Genel Fitness" },
];

const levels = [
  { value: "beginner", label: "🌱 Yeni Başlayan" },
  { value: "intermediate", label: "📈 Orta Seviye" },
  { value: "advanced", label: "🏆 İleri Seviye" },
];

const equipmentOptions = [
  "Dambıl",
  "Barbell",
  "Kettlebell",
  "Direnç Bandı",
  "Pull-up Bar",
  "Sadece Vücut Ağırlığı",
];

export default function WorkoutPlanPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const totalSteps = 5;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: "",
      level: "",
      daysPerWeek: "",
      duration: "",
      equipment: [],
      notes: "",
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
    router.push("/sport/workout-plan/result");
  };

  const progress = (currentStep / totalSteps) * 100;

  const stepVariants = {
    enter: {
      x: 300,
      opacity: 0,
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: {
      zIndex: 0,
      x: -300,
      opacity: 0,
    },
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Label className="text-xl font-semibold text-white mb-6 block">
              Amacınız nedir?
            </Label>
            <Controller
              name="goal"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-4"
                >
                  {goals.map((goal) => (
                    <div key={goal.value} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={goal.value}
                        id={goal.value}
                        className="w-6 h-6"
                      />
                      <Label
                        htmlFor={goal.value}
                        className="text-lg text-gray-300 cursor-pointer flex-1 p-4 rounded-lg border border-slate-600 hover:border-blue-500 hover:bg-slate-700/30 transition-all"
                      >
                        {goal.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Label className="text-xl font-semibold text-white mb-6 block">
              Deneyim seviyeniz?
            </Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-4"
                >
                  {levels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={level.value}
                        id={level.value}
                        className="w-6 h-6"
                      />
                      <Label
                        htmlFor={level.value}
                        className="text-lg text-gray-300 cursor-pointer flex-1 p-4 rounded-lg border border-slate-600 hover:border-blue-500 hover:bg-slate-700/30 transition-all"
                      >
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <Label className="text-xl font-semibold text-white mb-4 block">
                Haftalık kaç gün antrenman?
              </Label>
              <Controller
                name="daysPerWeek"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Gün sayısı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 gün</SelectItem>
                      <SelectItem value="4">4 gün</SelectItem>
                      <SelectItem value="5">5 gün</SelectItem>
                      <SelectItem value="6">6 gün</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label className="text-xl font-semibold text-white mb-4 block">
                Gün başına süre?
              </Label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Süre seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dakika</SelectItem>
                      <SelectItem value="45">45 dakika</SelectItem>
                      <SelectItem value="60">60 dakika</SelectItem>
                      <SelectItem value="90">90 dakika</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Label className="text-xl font-semibold text-white mb-6 block">
              Hangi ekipmanlar var?
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {equipmentOptions.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-3">
                  <Controller
                    name="equipment"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id={equipment}
                        checked={field.value?.includes(equipment)}
                        onCheckedChange={(checked) => {
                          const currentEquipment = field.value || [];
                          if (checked) {
                            field.onChange([...currentEquipment, equipment]);
                          } else {
                            field.onChange(
                              currentEquipment.filter((item) => item !== equipment)
                            );
                          }
                        }}
                      />
                    )}
                  />
                  <Label
                    htmlFor={equipment}
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    {equipment}
                  </Label>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Label className="text-xl font-semibold text-white mb-4 block">
              Özel notlar? (isteğe bağlı)
            </Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Örn: Sırt ağrım var, diz sakatlığım var..."
                  className="w-full bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                  {...field}
                />
              )}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
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
          <span className="text-sm text-gray-400">Egzersiz Programı</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏋️ Egzersiz Programı Oluştur
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Adım {currentStep} / {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto bg-slate-700/50 border-slate-600 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <div className="min-h-[400px] relative overflow-hidden">
                  {renderStep()}
                </div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-slate-600 text-gray-300 hover:bg-slate-600"
                >
                  ← Geri
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    İleri →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    Planı Oluştur 🎯
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

console.log("✅ Workout form ready");
