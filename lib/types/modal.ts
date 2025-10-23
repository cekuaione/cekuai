import type React from "react";

export type FeatureCategory = "sport" | "investing" | "business" | "education";

export interface FeatureModalConfig<FormData = Record<string, unknown>, Result = unknown> {
  id: string;
  category: FeatureCategory;
  title: string;
  description?: string;
  creditCost?: number;
  formSteps: FormStep[];
  aiTips: AITipConfig[];
  onSubmit: (data: FormData) => Promise<Result>;
  onSuccess?: (result: Result, data: FormData) => void;
  onError?: (error: Error, data: FormData) => void;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  validation?: (data: Record<string, unknown>) => ValidationResult;
}

export type FormFieldType =
  | "select"
  | "slider"
  | "radio"
  | "text"
  | "textarea"
  | "cards"
  | "number"
  | "custom";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  options?: FieldOption[];
  defaultValue?: unknown;
  required?: boolean;
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: React.ComponentType<any>; // For custom components
  componentProps?: Record<string, unknown>; // Props to pass to custom component
}

export interface FieldOption {
  value: string | number;
  label: string;
  description?: string;
  icon?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: Record<string, string>;
}

export interface AITipConfig {
  id: string;
  trigger: "field_focus" | "field_value" | "validation" | "step_change";
  fieldId?: string;
  stepId?: string;
  condition?: (formData: Record<string, unknown>, context: AITipContext) => boolean;
  content: string | ((formData: Record<string, unknown>, context: AITipContext) => string);
  type: "tip" | "warning" | "info" | "success";
  icon?: string;
}

export interface AITipContext {
  currentField?: string;
  currentStepId?: string;
  validationErrors?: Record<string, string>;
}

export interface FeatureModalState<Result = unknown> {
  isOpen: boolean;
  currentStep: number;
  formData: Record<string, unknown>;
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  result: Result | null;
}

export type FeatureModalView = "form" | "loading" | "success" | "error";
