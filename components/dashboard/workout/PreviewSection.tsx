"use client";

import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserTrainingPreferences } from "@/lib/workout/types";

interface PreviewSectionProps {
  formData: Partial<UserTrainingPreferences>;
  onEdit: (step: number, field?: string) => void;
}

export function PreviewSection({ formData, onEdit }: PreviewSectionProps) {
  const getGoalDescription = () => {
    if (!formData.goal) return "Belirtilmedi";
    
    const goalLabels = {
      muscle: "Kas Geliştirme",
      weight_loss: "Kilo Verme",
      endurance: "Dayanıklılık",
      general_fitness: "Genel Fitness",
    };
    
    let description = goalLabels[formData.goal];
    
    // Add goal-specific details
    if (formData.goal === "muscle" && formData.muscleDetails) {
      const { targetAreas, priority, phase } = formData.muscleDetails;
      const phaseLabels = { bulk: "Kas+kilo al", cut: "Yağ yak", recomp: "Denge" };
      const priorityLabels = { aesthetic: "Estetik", strength: "Kuvvet", balanced: "Dengeli" };
      description += ` (${targetAreas.join(", ")}, ${priorityLabels[priority]}, ${phaseLabels[phase]})`;
    } else if (formData.goal === "weight_loss" && formData.weightLossDetails) {
      const { cardioPreference, musclePriority } = formData.weightLossDetails;
      const cardioLabels = { love: "Cardio sever", tolerate: "Cardio tolere", dislike: "Cardio sevmez" };
      const muscleLabels = { fast_loss: "Hızlı kilo ver", preserve: "Kas koru", build: "Kas geliştir" };
      description += ` (${cardioLabels[cardioPreference]}, ${muscleLabels[musclePriority]})`;
    } else if (formData.goal === "endurance" && formData.enduranceDetails) {
      const { sportType, currentLevel } = formData.enduranceDetails;
      const sportLabels = { running: "Koşu", cycling: "Bisiklet", swimming: "Yüzme", general: "Genel" };
      const levelLabels = { baseline: "Başlangıç", moderate: "Orta", advanced: "İleri" };
      description += ` (${sportLabels[sportType]}, ${levelLabels[currentLevel]})`;
    } else if (formData.goal === "general_fitness" && formData.generalFitnessDetails) {
      const { mainFocus, lifestyle } = formData.generalFitnessDetails;
      const focusLabels = { strength: "Kuvvet", cardio: "Kardiyovasküler", flexibility: "Esneklik", balanced: "Dengeli" };
      const lifestyleLabels = { desk: "Masa başı", physical: "Fiziksel iş", mixed: "Karışık" };
      description += ` (${focusLabels[mainFocus]}, ${lifestyleLabels[lifestyle]})`;
    }
    
    return description;
  };

  const getLevelDescription = () => {
    if (!formData.level) return "Belirtilmedi";
    
    const levelDescriptions = {
      beginner: "Squat, deadlift, bench press hiç yapmadım",
      intermediate: "Temel egzersizleri biliyorum, form geliştirmeli",
      advanced: "Compound movements'ı güvenle yapıyorum",
    };
    
    return levelDescriptions[formData.level];
  };

  const getInjuriesDescription = () => {
    if (!formData.injuries || formData.injuries.length === 0) return "Yok";
    if (formData.injuries.includes("none")) return "Yok";
    
    const injuryLabels = {
      knee: "Diz",
      lower_back: "Alt sırt",
      shoulder: "Omuz",
      elbow: "Dirsek",
      wrist: "Bilek",
      neck: "Boyun",
      ankle: "Ayak bileği",
      other: "Diğer",
    };
    
    return formData.injuries.map(injury => injuryLabels[injury as keyof typeof injuryLabels] || injury).join(", ");
  };

  const getTrainingTimeDescription = () => {
    if (!formData.trainingTime) return "Belirtilmedi";
    
    const timeLabels = {
      morning: "Sabah (06-10)",
      midday: "Öğle (11-15)",
      evening: "Akşam (16-21)",
      flexible: "Esnek",
    };
    
    return timeLabels[formData.trainingTime];
  };

  const previewItems = [
    {
      label: "Yaş Aralığı",
      value: formData.ageRange || "Belirtilmedi",
      step: 1,
      field: "ageRange",
    },
    {
      label: "Hedef",
      value: getGoalDescription(),
      step: 1,
      field: "goal",
    },
    {
      label: "Deneyim Seviyesi",
      value: getLevelDescription(),
      step: 3,
      field: "level",
    },
    {
      label: "Yaralanmalar",
      value: getInjuriesDescription(),
      step: 3,
      field: "injuries",
    },
    {
      label: "Haftalık Gün",
      value: formData.daysPerWeek ? `${formData.daysPerWeek} gün` : "Belirtilmedi",
      step: 4,
      field: "daysPerWeek",
    },
    {
      label: "Günlük Süre",
      value: formData.durationPerDay ? `${formData.durationPerDay} dakika` : "Belirtilmedi",
      step: 4,
      field: "durationPerDay",
    },
    {
      label: "Antrenman Zamanı",
      value: getTrainingTimeDescription(),
      step: 4,
      field: "trainingTime",
    },
    {
      label: "Ekipman",
      value: formData.equipment && formData.equipment.length > 0 
        ? formData.equipment.join(", ") 
        : "Ekipman gerekmez",
      step: 4,
      field: "equipment",
    },
    {
      label: "Döngü Süresi",
      value: formData.targetWeeks ? `${formData.targetWeeks} hafta` : "Belirtilmedi",
      step: 5,
      field: "targetWeeks",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-2xl border border-sport/50 bg-sport-soft p-4 shadow-lg shadow-sport/30">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-sm font-semibold text-sport">Seçimlerinin Özeti</h3>
        </div>
        
        <div className="space-y-3">
          {previewItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-3 py-2"
            >
              <div className="flex-1">
                <span className="text-text-secondary text-xs">{item.label}: </span>
                <span className="text-text-primary text-sm">{item.value}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item.step, item.field)}
                className="h-6 w-6 p-0 text-sport hover:bg-sport/10"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        {formData.notes && (
          <div className="mt-4 rounded-xl border border-border/60 bg-card/80 px-3 py-2">
            <span className="text-text-secondary text-xs">Notlar: </span>
            <span className="text-text-primary text-sm">{formData.notes}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
