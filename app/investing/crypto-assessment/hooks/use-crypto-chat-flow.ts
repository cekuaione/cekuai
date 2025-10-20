"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type ConversationStep =
  | "welcome"
  | "crypto"
  | "amount"
  | "amount_input"
  | "risk"
  | "time"
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
  cryptoSymbol: string;
  investmentAmount: string;
  riskTolerance: string;
  timeHorizon: string;
  notes: string;
}

const CUSTOM_AMOUNT_OPTION = "💵 Özel Tutar Gir";

export function useCryptoChatFlow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<ConversationStep>("welcome");
  const [formData, setFormData] = useState<FormData>({
    cryptoSymbol: "",
    investmentAmount: "",
    riskTolerance: "",
    timeHorizon: "",
    notes: "",
  });
  const [isTyping, setIsTyping] = useState(false);

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
        [field]: Array.isArray(value) ? value.join(", ") : value,
      }));
    },
    []
  );

  const isComplete = useCallback(() => {
    return (
      Boolean(formData.cryptoSymbol) &&
      Boolean(formData.investmentAmount) &&
      Boolean(formData.riskTolerance) &&
      Boolean(formData.timeHorizon)
    );
  }, [formData]);

  useEffect(() => {
    if (currentStep === "welcome" && !processedStepsRef.current.has("welcome")) {
      processedStepsRef.current.add("welcome");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", "Merhaba! Kripto yatırım analizine hoş geldin. Sana en uygun stratejiyi oluşturalım mı? 💰");
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Hangi kripto para için analiz yapmak istersin?");
          setCurrentStep("crypto");
        }, 500);
      }, 1000);
    }
  }, [currentStep, addMessage]);

  useEffect(() => {
    if (currentStep === "crypto" && formData.cryptoSymbol && !processedStepsRef.current.has("crypto")) {
      processedStepsRef.current.add("crypto");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", `${formData.cryptoSymbol} için kapsamlı bir analiz hazırlayacağım.`);
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Ne kadar yatırım yapmayı planlıyorsun?");
          setCurrentStep("amount");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.cryptoSymbol, addMessage]);

  useEffect(() => {
    if (currentStep === "amount" && formData.investmentAmount && !processedStepsRef.current.has("amount")) {
      processedStepsRef.current.add("amount");
      setIsTyping(true);
      setTimeout(() => {
        if (formData.investmentAmount === CUSTOM_AMOUNT_OPTION) {
          addMessage("ai", "Lütfen yatırım tutarını yaz.");
          setIsTyping(false);
          setCurrentStep("amount_input");
          return;
        }

        addMessage("ai", `${formData.investmentAmount} tutarındaki yatırımını dikkate alacağım.`);
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Risk toleransın nedir?");
          setCurrentStep("risk");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.investmentAmount, addMessage]);

  useEffect(() => {
    if (
      currentStep === "amount_input" &&
      formData.investmentAmount &&
      formData.investmentAmount !== CUSTOM_AMOUNT_OPTION &&
      !processedStepsRef.current.has("amount_input")
    ) {
      processedStepsRef.current.add("amount_input");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", `${formData.investmentAmount} tutarındaki yatırımını dikkate alacağım.`);
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Risk toleransın nedir?");
          setCurrentStep("risk");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.investmentAmount, addMessage]);

  useEffect(() => {
    if (currentStep === "risk" && formData.riskTolerance && !processedStepsRef.current.has("risk")) {
      processedStepsRef.current.add("risk");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", `${formData.riskTolerance} risk toleransına uygun öneriler hazırlayacağım.`);
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Yatırımı ne kadar süre değerlendirmeyi planlıyorsun?");
          setCurrentStep("time");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.riskTolerance, addMessage]);

  useEffect(() => {
    if (currentStep === "time" && formData.timeHorizon && !processedStepsRef.current.has("time")) {
      processedStepsRef.current.add("time");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", `${formData.timeHorizon} zaman ufkuna göre analiz yapacağım.`);
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Eklemek istediğin bir not var mı?");
          setCurrentStep("notes");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.timeHorizon, addMessage]);

  useEffect(() => {
    if (
      currentStep === "notes" &&
      formData.notes !== undefined &&
      formData.notes !== "" &&
      !processedStepsRef.current.has("notes")
    ) {
      processedStepsRef.current.add("notes");
      setIsTyping(true);
      setTimeout(() => {
        if (formData.notes === "Yok") {
          addMessage("ai", "Tamamdır, özel bir not yok.");
          setIsTyping(false);
          setTimeout(() => {
            setCurrentStep("summary");
          }, 500);
        } else if (formData.notes === "Not Ekle") {
          addMessage("ai", "Notunu buraya yazabilirsin:");
          setIsTyping(false);
          setCurrentStep("notes_input");
        }
      }, 1000);
    }
  }, [currentStep, formData.notes, addMessage]);

  useEffect(() => {
    if (
      currentStep === "notes_input" &&
      formData.notes &&
      formData.notes !== "Not Ekle" &&
      !processedStepsRef.current.has("notes_input")
    ) {
      processedStepsRef.current.add("notes_input");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", "Notunu dikkate alacağım.");
        setIsTyping(false);
        setTimeout(() => {
          setCurrentStep("summary");
        }, 500);
      }, 1000);
    }
  }, [currentStep, formData.notes, addMessage]);

  useEffect(() => {
    if (currentStep === "summary" && !processedStepsRef.current.has("summary")) {
      processedStepsRef.current.add("summary");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", "Harika! İşte tercihlerin:");
        setIsTyping(false);
        setTimeout(() => {
          addMessage("ai", "Değiştirmek istediğin bir şey var mı?");
        }, 500);
      }, 1000);
    }
  }, [currentStep, addMessage]);

  useEffect(() => {
    if (currentStep === "edit_selection" && editTarget && !processedStepsRef.current.has("edit_selection")) {
      processedStepsRef.current.add("edit_selection");
      setIsTyping(true);
      setTimeout(() => {
        addMessage("ai", "Tamam, bunu güncelleyelim:");
        setIsTyping(false);
        if (editTarget === "crypto") {
          addMessage("ai", "Hangi kripto para için analiz yapalım?");
          setCurrentStep("crypto");
        } else if (editTarget === "amount") {
          addMessage("ai", "Ne kadar yatırım yapmak istiyorsun?");
          setCurrentStep("amount");
        } else if (editTarget === "risk") {
          addMessage("ai", "Risk toleransın nedir?");
          setCurrentStep("risk");
        } else if (editTarget === "time") {
          addMessage("ai", "Yatırım süren ne kadar olacak?");
          setCurrentStep("time");
        } else if (editTarget === "notes") {
          addMessage("ai", "Eklemek istediğin özel bir not var mı?");
          setCurrentStep("notes");
        }
      }, 1000);
    }
  }, [currentStep, editTarget, addMessage]);

  const confirmAndGenerate = useCallback(() => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage("ai", "Analizini başlatıyorum... Bu 30-60 saniye sürebilir ⏳");
      setCurrentStep("generating");
      setIsTyping(false);
    }, 1000);
  }, [addMessage]);

  const startEdit = useCallback((target: string) => {
    processedStepsRef.current.delete("edit_selection");

    if (target === "crypto" || target === "risk" || target === "time") {
      processedStepsRef.current.delete(target as ConversationStep);
    }

    if (target === "amount") {
      processedStepsRef.current.delete("amount");
      processedStepsRef.current.delete("amount_input");
    }

    if (target === "notes") {
      processedStepsRef.current.delete("notes");
      processedStepsRef.current.delete("notes_input");
    }

    setFormData((prev) => {
      if (target === "crypto") {
        return { ...prev, cryptoSymbol: "" };
      }
    if (target === "amount") {
      return { ...prev, investmentAmount: "" };
    }
      if (target === "risk") {
        return { ...prev, riskTolerance: "" };
      }
      if (target === "time") {
        return { ...prev, timeHorizon: "" };
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
