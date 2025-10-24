"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";

import type { FeatureModalConfig, FormField } from "@/lib/types/modal";
import { cn } from "@/lib/utils";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { useFeatureModal } from "@/hooks/useFeatureModal";
import { PreviewSection } from "@/components/dashboard/workout/PreviewSection";

interface FeatureModalProps {
  config: FeatureModalConfig;
  initialData?: Record<string, unknown>;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get dynamic fields based on goal
function getDynamicFields(goal: string): FormField[] {
  switch (goal) {
    case "muscle":
      return [
        {
          id: "targetAreas",
          type: "cards",
          label: "Hangi vücut bölgelerine odaklanmak istiyorsun?",
          multiple: true,
          required: true,
          options: [
            { value: "full_body", label: "Tüm Vücut", icon: "🏋️‍♂️" },
            { value: "chest", label: "Göğüs", icon: "💪" },
            { value: "back", label: "Sırt", icon: "🦴" },
            { value: "legs", label: "Bacaklar", icon: "🦵" },
            { value: "shoulders", label: "Omuzlar", icon: "💪" },
            { value: "arms", label: "Kollar", icon: "🦾" },
            { value: "core", label: "Core", icon: "🔥" },
          ],
        },
        {
          id: "priority",
          type: "radio",
          label: "Önceliğin nedir?",
          required: true,
          options: [
            { value: "aesthetic", label: "Estetik", icon: "✨" },
            { value: "strength", label: "Kuvvet", icon: "💪" },
            { value: "balanced", label: "Dengeli", icon: "⚖️" },
          ],
        },
        {
          id: "phase",
          type: "radio",
          label: "Hangi aşamadasın?",
          required: true,
          options: [
            { value: "bulk", label: "Kas+Kilo Al", icon: "📈" },
            { value: "cut", label: "Yağ Yak", icon: "🔥" },
            { value: "recomp", label: "Denge", icon: "⚖️" },
          ],
        },
      ];
    case "weight_loss":
      return [
        {
          id: "cardioPreference",
          type: "cards",
          label: "Cardio hakkında ne düşünüyorsun?",
          required: true,
          options: [
            { value: "love", label: "Severim", icon: "❤️" },
            { value: "tolerate", label: "Tolere ederim", icon: "😐" },
            { value: "dislike", label: "Sevmem", icon: "😤" },
          ],
        },
        {
          id: "activityLevel",
          type: "cards",
          label: "Günlük aktivite seviyen nedir?",
          required: true,
          options: [
            { value: "sedentary", label: "Hareketsiz", icon: "🛋️" },
            { value: "light", label: "Hafif Aktif", icon: "🚶" },
            { value: "active", label: "Aktif", icon: "🏃" },
          ],
        },
        {
          id: "musclePriority",
          type: "radio",
          label: "Kas konusunda önceliğin nedir?",
          required: true,
          options: [
            { value: "fast_loss", label: "Hızlı kilo ver", icon: "⚡" },
            { value: "preserve", label: "Kas koru", icon: "🛡️" },
            { value: "build", label: "Kas geliştir", icon: "💪" },
          ],
        },
      ];
    case "endurance":
      return [
        {
          id: "sportType",
          type: "cards",
          label: "Hangi spor dalına odaklanmak istiyorsun?",
          required: true,
          options: [
            { value: "running", label: "Koşu", icon: "🏃" },
            { value: "cycling", label: "Bisiklet", icon: "🚴" },
            { value: "swimming", label: "Yüzme", icon: "🏊" },
            { value: "general", label: "Genel", icon: "🏃‍♂️" },
          ],
        },
        {
          id: "currentLevel",
          type: "cards",
          label: "Şu anki dayanıklılık seviyen nedir?",
          required: true,
          options: [
            { value: "baseline", label: "Başlangıç", icon: "🌱", description: "20dk koşamam" },
            { value: "moderate", label: "Orta", icon: "🌿", description: "30-45dk koşarım" },
            { value: "advanced", label: "İleri", icon: "🌳", description: "1 saat+ koşarım" },
          ],
        },
        {
          id: "specificGoal",
          type: "textarea",
          label: "Spesifik hedefin var mı? (opsiyonel)",
          placeholder: "Örn: 5K'yı 30 dakikada koşmak",
        },
      ];
    case "general_fitness":
      return [
        {
          id: "mainFocus",
          type: "cards",
          label: "Ana odak noktan nedir?",
          required: true,
          options: [
            { value: "strength", label: "Kuvvet", icon: "💪" },
            { value: "cardio", label: "Kardiyovasküler", icon: "❤️" },
            { value: "flexibility", label: "Esneklik", icon: "🧘" },
            { value: "balanced", label: "Dengeli", icon: "⚖️" },
          ],
        },
        {
          id: "lifestyle",
          type: "cards",
          label: "Yaşam tarzın nasıl?",
          required: true,
          options: [
            { value: "desk", label: "Masa Başı", icon: "💻" },
            { value: "physical", label: "Fiziksel İş", icon: "🔨" },
            { value: "mixed", label: "Karışık", icon: "🔄" },
          ],
        },
      ];
    default:
      return [];
  }
}

export function FeatureModal({ config, initialData, isOpen, onClose }: FeatureModalProps) {
  const modal = useFeatureModal(config, { initialData, onClose });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobileAITab, setMobileAITab] = useState(false);
  const modalIsOpen = modal.state.isOpen;
  const openModalFn = modal.openModal;
  const closeModalFn = modal.closeModal;

  useEffect(() => {
    if (isOpen && !modalIsOpen) {
      openModalFn(initialData);
    } else if (!isOpen && modalIsOpen) {
      closeModalFn();
    }
  }, [closeModalFn, openModalFn, initialData, isOpen, modalIsOpen]);

  useEffect(() => {
    if (!modalIsOpen) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeModalFn();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [closeModalFn, modalIsOpen]);

  useEffect(() => {
    if (modalIsOpen) {
      containerRef.current?.focus();
    }
  }, [modalIsOpen]);

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModalFn();
    }
  };

  const activeStep = modal.activeStep;
  const isLastStep = modal.currentStep === config.formSteps.length - 1;
  const context = {
    currentField: modal.currentField,
    currentStepId: activeStep?.id,
    validationErrors: modal.validationErrors,
  };

  if (!modalIsOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/60 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="relative flex h-[90vh] w-[90vw] max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition"
      >
        <div className="flex h-full flex-col lg:flex-row">
          <div className="flex-1 overflow-hidden bg-background">
            <FormPanel
              config={config}
              modal={modal}
              isLastStep={isLastStep}
              isMobileAITab={isMobileAITab}
              setMobileAITab={setMobileAITab}
            />
          </div>
          <div className="hidden w-full max-w-sm lg:block">
            <AIAssistant
              config={config}
              formData={modal.formData}
              context={context}
              view={modal.view}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormPanelProps {
  config: FeatureModalConfig;
  modal: ReturnType<typeof useFeatureModal>;
  isLastStep: boolean;
  isMobileAITab: boolean;
  setMobileAITab(value: boolean): void;
}

function FormPanel({ config, modal, isLastStep, isMobileAITab, setMobileAITab }: FormPanelProps) {
  const { activeStep, view, setCurrentField } = modal;
  const totalSteps = config.formSteps.length;
  const firstFieldId = activeStep?.fields?.[0]?.id;

  useEffect(() => {
    if (view !== "form") return;

    if (firstFieldId) {
      setCurrentField(firstFieldId);
    } else {
      setCurrentField(undefined);
    }
  }, [firstFieldId, setCurrentField, view]);

  const handleFocus = useCallback(
    (fieldId: string) => {
      modal.setCurrentField(fieldId);
    },
    [modal]
  );

  const handleBlur = useCallback(() => {
    modal.setCurrentField(undefined);
  }, [modal]);

  const renderView = () => {
    switch (modal.view) {
      case "loading":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="text-4xl">⏳</span>
            <p className="text-sm text-text-secondary">İşleniyor, lütfen bekleyin...</p>
          </div>
        );
      case "success":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="text-4xl">🎉</span>
            <p className="text-base font-semibold text-text-primary">İşlem tamamlandı</p>
            <p className="text-sm text-text-secondary">Öne çıkan sonuçlar AI panelinde yer alıyor. Sayfayı kapatabilirsiniz.</p>
            <div className="mt-4">
              <button
                type="button"
                onClick={modal.closeModal}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-primary hover:border-link hover:text-link"
              >
                Kapat
              </button>
            </div>
          </div>
        );
      case "error":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="text-base font-semibold text-text-primary">Bir hata oluştu</p>
            <p className="text-sm text-text-secondary">Alanları kontrol ettikten sonra tekrar deneyebilirsin.</p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  modal.submit();
                }}
                className="rounded-full bg-link px-4 py-2 text-sm font-medium text-background hover:bg-link/90"
              >
                Tekrar dene
              </button>
            </div>
          </div>
        );
      case "form":
      default:
        return (
          <form
            className="flex h-full flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              if (isLastStep) {
                modal.submit();
              } else {
                modal.nextStep();
              }
            }}
          >
            <div className="border-b border-border bg-background/80 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/80">
                    {config.title}
                  </p>
                  <h2 className="text-lg font-semibold text-text-primary">
                    {activeStep?.title || "Form"}
                  </h2>
                  {activeStep?.description ? (
                    <p className="text-sm text-text-secondary">{activeStep.description}</p>
                  ) : null}
                </div>
                <span className="text-xs font-medium text-text-secondary">
                  Adım {modal.currentStep + 1}/{totalSteps}
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-link to-link/70"
                  style={{ width: `${((modal.currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeStep?.fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={modal.formData[field.id]}
                  error={modal.validationErrors[field.id]}
                  onChange={(value) => modal.updateFormData(field.id, value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              ))}
              
              {activeStep?.id === "goal-specific" && modal.formData.goal ? (
                getDynamicFields(modal.formData.goal as string).map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={modal.formData[field.id]}
                    error={modal.validationErrors[field.id]}
                    onChange={(value) => modal.updateFormData(field.id, value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                ))
              ) : null}
              
              {activeStep?.id === "experience-safety" && modal.formData.injuries && 
               Array.isArray(modal.formData.injuries) && 
               modal.formData.injuries.length > 0 && 
               modal.formData.injuries.includes("other") ? (
                <FieldRenderer
                  key="injuryDetails"
                  field={{
                    id: "injuryDetails",
                    type: "textarea",
                    label: "Yaralanma detayları",
                    placeholder: "Yaralanmalar hakkında detay (opsiyonel)",
                  }}
                  value={modal.formData.injuryDetails}
                  error={modal.validationErrors.injuryDetails}
                  onChange={(value) => modal.updateFormData("injuryDetails", value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              ) : null}
              
              {activeStep?.id === "experience-safety" && modal.formData.level && modal.formData.level !== "beginner" ? (
                <FieldRenderer
                  key="compoundMovements"
                  field={{
                    id: "compoundMovements",
                    type: "cards",
                    label: "Hangi compound movements'ı rahatça yapıyorsun?",
                    multiple: true,
                    required: true,
                    options: [
                      { value: "squat", label: "Squat", icon: "🦵" },
                      { value: "deadlift", label: "Deadlift", icon: "🏋️" },
                      { value: "bench_press", label: "Bench Press", icon: "💪" },
                      { value: "overhead_press", label: "Overhead Press", icon: "🦾" },
                      { value: "pull_ups", label: "Pull-ups", icon: "🪜" },
                    ],
                  }}
                  value={modal.formData.compoundMovements}
                  error={modal.validationErrors.compoundMovements}
                  onChange={(value) => modal.updateFormData("compoundMovements", value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              ) : null}
              
              {activeStep?.id === "cycle-preview" && (
                <PreviewSection
                  formData={modal.formData}
                  onEdit={(step, field) => {
                    modal.setCurrentStep(step - 1);
                    if (field) {
                      modal.setCurrentField(field);
                    }
                  }}
                />
              )}
            </div>

            <div className="border-t border-border bg-background/80 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  {modal.error ? <span className="text-destructive">{modal.error}</span> : null}
                </div>
                <div className="flex gap-3">
                  {modal.currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={modal.prevStep}
                      className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:border-link hover:text-link"
                    >
                      Geri
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={modal.isSubmitting}
                    className="flex items-center gap-2 rounded-full bg-link px-5 py-2 text-sm font-medium text-background transition hover:bg-link/90 disabled:opacity-60"
                  >
                    {modal.isSubmitting ? "Gönderiliyor..." : isLastStep ? "Gönder" : "İleri"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="block border-b border-border bg-background/80 px-6 py-3 text-sm text-text-secondary lg:hidden">
        <div className="flex items-center justify-between">
          <span>AI İpuçları</span>
          <button
            type="button"
            onClick={() => setMobileAITab(!isMobileAITab)}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary"
          >
            {isMobileAITab ? "Form" : "AI"}
          </button>
        </div>
      </div>
            <div className="flex-1 overflow-hidden">
        {isMobileAITab ? (
          <div className="block lg:hidden">
            <AIAssistant
              config={config}
              formData={modal.formData}
              context={{
                currentField: modal.currentField,
                currentStepId: activeStep?.id,
                validationErrors: modal.validationErrors,
              }}
              view={modal.view}
            />
          </div>
        ) : null}
        <div className={cn("h-full", isMobileAITab ? "hidden lg:block" : "block")}>{renderView()}</div>
      </div>
    </div>
  );
}

interface FieldRendererProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onFocus: (id: string) => void;
  onBlur: () => void;
}

function FieldRenderer({ field, value, error, onChange, onFocus, onBlur }: FieldRendererProps) {
  const handleFocus = () => onFocus(field.id);

  const commonLabel = (
    <label htmlFor={field.id} className="block text-sm font-medium text-text-primary">
      {field.label}
    </label>
  );

  const helper = field.helperText ? (
    <p className="text-xs text-text-secondary">{field.helperText}</p>
  ) : null;

  const errorMessage = error ? (
    <p className="text-xs text-destructive">{error}</p>
  ) : null;

  switch (field.type) {
    case "text":
      return (
        <div className="mb-4 space-y-1">
          {commonLabel}
          <input
            id={field.id}
            name={field.id}
            type="text"
            defaultValue={(value as string | undefined) ?? ""}
            placeholder={field.placeholder}
            onFocus={handleFocus}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-text-primary outline-none focus:border-link focus:ring-1 focus:ring-link/40"
          />
          {helper}
          {errorMessage}
        </div>
      );
    case "textarea":
      return (
        <div className="mb-4 space-y-1">
          {commonLabel}
          <textarea
            id={field.id}
            name={field.id}
            rows={4}
            defaultValue={(value as string | undefined) ?? ""}
            placeholder={field.placeholder}
            onFocus={handleFocus}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-text-primary outline-none focus:border-link focus:ring-1 focus:ring-link/40"
          />
          {helper}
          {errorMessage}
        </div>
      );
    case "number":
      return (
        <div className="mb-4 space-y-1">
          {commonLabel}
          <input
            id={field.id}
            name={field.id}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            defaultValue={Number(
              typeof value === "number"
                ? value
                : typeof field.defaultValue === "number"
                ? field.defaultValue
                : field.min ?? 0
            )}
            placeholder={field.placeholder}
            onFocus={handleFocus}
            onBlur={onBlur}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-text-primary outline-none focus:border-link focus:ring-1 focus:ring-link/40"
          />
          {helper}
          {errorMessage}
        </div>
      );
    case "slider":
      return (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            {commonLabel}
            <span className="text-sm font-semibold text-text-primary">
              {formatNumericDisplay(value ?? field.defaultValue ?? field.min)}
            </span>
          </div>
          {helper}
          <input
            id={field.id}
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            defaultValue={Number(
              typeof value === "number"
                ? value
                : typeof field.defaultValue === "number"
                ? field.defaultValue
                : field.min ?? 0
            )}
            onFocus={handleFocus}
            onBlur={onBlur}
            onChange={(event) => {
              handleFocus();
              onChange(Number(event.target.value));
            }}
            className="w-full"
          />
          {errorMessage}
        </div>
      );
    case "select":
      return (
        <div className="mb-4 space-y-1">
          {commonLabel}
          <select
            id={field.id}
            name={field.id}
            defaultValue={(value as string | undefined) ?? ""}
            onFocus={handleFocus}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-text-primary outline-none focus:border-link focus:ring-1 focus:ring-link/40"
          >
            <option value="" disabled>
              {field.placeholder ?? "Seç"}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {helper}
          {errorMessage}
        </div>
      );
    case "radio":
      return (
        <div className="mb-4 space-y-2">
          {commonLabel}
          <div className="grid gap-2 sm:grid-cols-3">
            {field.options?.map((option) => {
              const isSelected = value === option.value;
              const select = () => {
                handleFocus();
                onChange(option.value);
              };
              return (
                <button
                  key={option.value}
                  type="button"
                  onFocus={handleFocus}
                  onBlur={onBlur}
                  onClick={select}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-sm transition",
                    isSelected
                      ? "border-link bg-link/10 text-link"
                      : "border-border bg-background text-text-secondary hover:border-link/40"
                  )}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium text-text-primary">{option.label}</span>
                </button>
              );
            })}
          </div>
          {helper}
          {errorMessage}
        </div>
      );
    case "cards":
      return (
        <div className="mb-4 space-y-2">
          {commonLabel}
          <div className="grid gap-3 sm:grid-cols-2">
            {field.options?.map((option) => {
              const currentValue = value ?? (field.multiple ? [] : undefined);
              const isSelected = field.multiple
                ? Array.isArray(currentValue) && currentValue.includes(option.value)
                : currentValue === option.value;

              const selectOption = () => {
                handleFocus();
                if (field.multiple) {
                  const existing = Array.isArray(currentValue) ? currentValue : [];
                  if (isSelected) {
                    onChange(existing.filter((item) => item !== option.value));
                  } else {
                    onChange([...existing, option.value]);
                  }
                } else {
                  onChange(option.value);
                }
              };

              const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectOption();
                }
              };

              const label = typeof option.label === "string" ? option.label : String(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onFocus={handleFocus}
                  onBlur={onBlur}
                  onClick={selectOption}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-link/40",
                    "cursor-pointer select-none",
                    isSelected
                      ? "border-link bg-link/10 text-link shadow-sm"
                      : "border-border bg-background text-text-secondary hover:border-link/40 hover:bg-background/80"
                  )}
                  aria-pressed={isSelected}
                  aria-label={label}
                  data-selected={isSelected ? "true" : "false"}
                >
                  {option.icon ? <span className="text-xl">{option.icon}</span> : null}
                  <div>
                    <p className="font-medium text-text-primary">{label}</p>
                    {option.description ? (
                      <p className="text-xs text-text-secondary">{option.description}</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
          {helper}
          {errorMessage}
        </div>
      );
    case "custom":
      if (field.component && field.componentProps) {
        const CustomComponent = field.component;
        return (
          <div className="mb-4 space-y-1">
            {commonLabel}
            <CustomComponent
              {...field.componentProps}
              defaultUrl={value as string}
              onImageReady={(url: string) => {
                handleFocus();
                onChange(url);
              }}
              onError={(error: string) => {
                // Handle error - could be passed to parent or shown in UI
                console.error("ImageUpload error:", error);
              }}
            />
            {helper}
            {errorMessage}
          </div>
        );
      }
      return null;
    default:
      return null;
  }
}

export default FeatureModal;

function formatNumericDisplay(value: unknown): string {
  if (typeof value === "number") {
    return new Intl.NumberFormat("tr-TR").format(value);
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return new Intl.NumberFormat("tr-TR").format(numeric);
  }
  return "";
}
