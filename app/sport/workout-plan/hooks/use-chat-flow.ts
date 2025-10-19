"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type ConversationStep =
  | "welcome"
  | "goal"
  | "level"
  | "days"
  | "duration"
  | "equipment"
  | "notes"
  | "notes_input"
  | "summary"
  | "edit_selection"
  | "generating";

export interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
}

export interface FormData {
  goal: string;
  level: string;
  daysPerWeek: string;
  duration: string;
  equipment: string[];
  notes: string;
}

export function useChatFlow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<ConversationStep>("welcome");
  const [formData, setFormData] = useState<FormData>({
    goal: "",
    level: "",
    daysPerWeek: "",
    duration: "",
    equipment: [],
    notes: "",
  });
  const [isTyping, setIsTyping] = useState(false);
  
  // Track which steps have been processed to prevent duplicates
  const processedStepsRef = useRef<Set<ConversationStep>>(new Set());
  const [editTarget, setEditTarget] = useState<string>("");

  const addMessage = useCallback((type: "ai" | "user", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const selectOption = useCallback(
    (field: keyof FormData, value: string | string[]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const isComplete = useCallback(() => {
    return (
      formData.goal &&
      formData.level &&
      formData.daysPerWeek &&
      formData.duration &&
      formData.equipment.length > 0
    );
  }, [formData]);

  // Initialize conversation
  useEffect(() => {
    if (currentStep === "welcome" && !processedStepsRef.current.has("welcome")) {
      processedStepsRef.current.add("welcome");
      setIsTyping(true);
      setTimeout(() => {
        addMessage(
          "ai",
          "Merhaba! Ben senin kişisel antrenman koçunum. Sana özel bir program hazırlayacağım 💪"
        );
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "İlk soru: Antrenman hedefin ne?");
          setCurrentStep("goal");
        }, 500);
      }, 1000);
    }
  }, [currentStep, addMessage]);

  // Handle goal step
  useEffect(() => {
    if (currentStep === "goal" && formData.goal && !processedStepsRef.current.has("goal")) {
      processedStepsRef.current.add("goal");
      setIsTyping(true);
      setTimeout(() => {
        addMessage(
          "ai",
          `Harika seçim! ${formData.goal} için mükemmel bir program yapacağız.`
        );
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Şu anki fitness seviyen nedir?");
          setCurrentStep("level");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.goal, addMessage]);

  // Handle level step
  useEffect(() => {
    if (currentStep === "level" && formData.level && !processedStepsRef.current.has("level")) {
      processedStepsRef.current.add("level");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", `Anladım, ${formData.level} seviyesindesin. Buna göre ayarlayacağım.`);
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Haftada kaç gün antrenman yapmak istiyorsun?");
          setCurrentStep("days");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.level, addMessage]);

  // Handle days step
  useEffect(() => {
    if (currentStep === "days" && formData.daysPerWeek && !processedStepsRef.current.has("days")) {
      processedStepsRef.current.add("days");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", `Tamam, haftada ${formData.daysPerWeek} gün antrenman yapacağız.`);
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Antrenman başına ne kadar süre ayırabilirsin?");
          setCurrentStep("duration");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.daysPerWeek, addMessage]);

  // Handle duration step
  useEffect(() => {
    if (currentStep === "duration" && formData.duration && !processedStepsRef.current.has("duration")) {
      processedStepsRef.current.add("duration");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", `Harika! ${formData.duration} dakikalık antrenmanlar hazırlayacağım.`);
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Hangi ekipmanlara sahipsin? Birden fazla seçebilirsin.");
          setCurrentStep("equipment");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.duration, addMessage]);

  // Handle equipment step
  useEffect(() => {
    if (currentStep === "equipment" && formData.equipment.length > 0 && !processedStepsRef.current.has("equipment")) {
      processedStepsRef.current.add("equipment");
      setIsTyping(true);
      setTimeout(() => {
        addMessage(
          "ai",
          `Mükemmel! ${formData.equipment.join(", ")} ile harika bir program yapacağız.`
        );
        setIsTyping(false);
        setTimeout(() => {
          addMessage(
            "ai",
            "Son olarak, bana özel bir notun var mı? Sakatlık, sağlık durumu veya dikkat etmem gereken bir şey?"
          );
          setCurrentStep("notes");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.equipment, addMessage]);

  // Handle notes selection (Yok or text input)
  useEffect(() => {
    if (currentStep === "notes" && formData.notes !== undefined && formData.notes !== "" && !processedStepsRef.current.has("notes")) {
      processedStepsRef.current.add("notes");
      setIsTyping(true);
      setTimeout(() => {
        if (formData.notes === "Yok") {
          addMessage("ai", "Tamam, özel bir durum yok.");
          setIsTyping(false);
          setTimeout(() => {
            setCurrentStep("summary");
          }, 500);
        } else if (formData.notes === "Özel notum var") {
          addMessage("ai", "Notunu buraya yazabilirsin:");
          setIsTyping(false);
          setCurrentStep("notes_input");
        }
      }, 1000);
    }
  }, [currentStep, formData.notes, addMessage]);

  // Handle notes text input
  useEffect(() => {
    if (currentStep === "notes_input" && formData.notes && formData.notes !== "Özel notum var" && !processedStepsRef.current.has("notes_input")) {
      processedStepsRef.current.add("notes_input");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", "Anladım, bunları göz önünde bulunduracağım.");
        setIsTyping(false);
        setTimeout(() => {
          setCurrentStep("summary");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.notes, addMessage]);

  // Handle summary step
  useEffect(() => {
    if (currentStep === "summary" && !processedStepsRef.current.has("summary")) {
      processedStepsRef.current.add("summary");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", "Harika! İşte seçimlerinin özeti:");
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Değiştirmek istediğin bir şey var mı?");
        }, 500);
      }, 1000);
    }
  }, [currentStep, addMessage]);

  // Handle edit selection
  useEffect(() => {
    if (currentStep === "edit_selection" && editTarget && !processedStepsRef.current.has("edit_selection")) {
      processedStepsRef.current.add("edit_selection");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", "Tamam, değiştirelim:");
        setIsTyping(false);
        // Navigate to the selected step
        if (editTarget === "goal") {
          addMessage("ai", "Antrenman hedefin ne?");
          setCurrentStep("goal");
        } else if (editTarget === "level") {
          addMessage("ai", "Şu anki fitness seviyen nedir?");
          setCurrentStep("level");
        } else if (editTarget === "days") {
          addMessage("ai", "Haftada kaç gün antrenman yapmak istiyorsun?");
          setCurrentStep("days");
        } else if (editTarget === "duration") {
          addMessage("ai", "Antrenman başına ne kadar süre ayırabilirsin?");
          setCurrentStep("duration");
        } else if (editTarget === "equipment") {
          addMessage("ai", "Hangi ekipmanlara sahipsin?");
          setCurrentStep("equipment");
        } else if (editTarget === "notes") {
          addMessage("ai", "Özel bir notun var mı?");
          setCurrentStep("notes");
        }
      }, 1000);
    }
  }, [currentStep, editTarget, addMessage]);

  const confirmAndGenerate = useCallback(() => {
    setIsTyping(true);
    console.log("🎯 Plan generation clicked");
    setTimeout(() => {
      addMessage("ai", "Programını hazırlıyorum... Bu 30-40 saniye sürebilir ⏳");
      setCurrentStep("generating");
      setIsTyping(false);
    }, 1000);
  }, [addMessage]);

  const startEdit = useCallback((target: string) => {
    processedStepsRef.current.delete("edit_selection");

    if (target === "goal" || target === "level" || target === "days" || target === "duration" || target === "equipment") {
      processedStepsRef.current.delete(target as ConversationStep);
    }

    if (target === "notes") {
      processedStepsRef.current.delete("notes");
      processedStepsRef.current.delete("notes_input");
    }

    setFormData((prev) => {
      if (target === "goal") {
        return { ...prev, goal: "" };
      }
      if (target === "level") {
        return { ...prev, level: "" };
      }
      if (target === "days") {
        return { ...prev, daysPerWeek: "" };
      }
      if (target === "duration") {
        return { ...prev, duration: "" };
      }
      if (target === "equipment") {
        return { ...prev, equipment: [] };
      }
      if (target === "notes") {
        return { ...prev, notes: "" };
      }
      return prev;
    });

    setEditTarget(target);
    setCurrentStep("edit_selection");
  }, []);

  const resetToSummary = useCallback(() => {
    setIsTyping(false);
    setEditTarget("");
    setCurrentStep("summary");
  }, []);

  return {
    messages,
    currentStep,
    formData,
    isTyping,
    addMessage,
    selectOption,
    isComplete,
    confirmAndGenerate,
    startEdit,
    resetToSummary,
  };
}
