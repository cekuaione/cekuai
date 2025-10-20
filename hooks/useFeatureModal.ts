"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  FeatureModalConfig,
  FeatureModalState,
  FeatureModalView,
  FormStep,
} from "@/lib/types/modal";

interface UseFeatureModalOptions {
  initialData?: Record<string, unknown>;
  onClose?: () => void;
}

export function useFeatureModal<Result = unknown>(
  config: FeatureModalConfig,
  options: UseFeatureModalOptions = {}
) {
  const { initialData = {}, onClose } = options;

  const defaultFormData = useMemo(
    () => buildDefaultFormData(config.formSteps),
    [config.formSteps]
  );

  const [state, setState] = useState<FeatureModalState<Result>>({
    isOpen: false,
    currentStep: 0,
    formData: { ...defaultFormData, ...initialData },
    validationErrors: {},
    isSubmitting: false,
    isLoading: false,
    error: null,
    result: null,
  });

  const [view, setView] = useState<FeatureModalView>("form");
  const [currentField, setCurrentField] = useState<string | undefined>(undefined);

  const activeStep: FormStep | undefined = useMemo(
    () => config.formSteps[state.currentStep],
    [config.formSteps, state.currentStep]
  );

  const openModal = useCallback((data?: Record<string, unknown>) => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      formData: { ...defaultFormData, ...initialData, ...(data ?? {}) },
      currentStep: 0,
      validationErrors: {},
      result: null,
      error: null,
    }));
    setCurrentField(undefined);
    setView("form");
  }, [defaultFormData, initialData]);

  const closeModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      currentStep: 0,
      validationErrors: {},
      result: null,
      error: null,
      formData: { ...defaultFormData, ...initialData },
    }));
    setCurrentField(undefined);
    setView("form");
    onClose?.();
  }, [defaultFormData, initialData, onClose]);

  const updateFormData = useCallback((fieldId: string, value: unknown) => {
    setState((prev) => {
      const nextFormData = { ...prev.formData, [fieldId]: value };
      const nextErrors = { ...prev.validationErrors };
      if (nextErrors[fieldId]) {
        delete nextErrors[fieldId];
      }
      return {
        ...prev,
        formData: nextFormData,
        validationErrors: nextErrors,
      };
    });
  }, []);

  const runStepValidation = useCallback(
    (stepIndex: number) => {
      const step = config.formSteps[stepIndex];
      if (!step) return { valid: true, errors: {} };

      const result = step.validation
        ? step.validation(state.formData)
        : defaultStepValidation(step, state.formData);

      if (!result.valid) {
        setState((prev) => ({
          ...prev,
          validationErrors: { ...prev.validationErrors, ...(result.errors ?? {}) },
        }));
      }

      return result;
    },
    [config.formSteps, state.formData]
  );

  const nextStep = useCallback(() => {
    if (state.currentStep >= config.formSteps.length - 1) return;
    const validationResult = runStepValidation(state.currentStep);
    if (!validationResult.valid) {
      setView("form");
      return;
    }
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
    setCurrentField(undefined);
  }, [config.formSteps.length, runStepValidation, state.currentStep]);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
    setCurrentField(undefined);
  }, []);

  const submit = useCallback(async () => {
    // Validate all steps
    for (let index = 0; index < config.formSteps.length; index += 1) {
      const result = runStepValidation(index);
      if (!result.valid) {
        setState((prev) => ({
          ...prev,
          currentStep: index,
        }));
        setView("form");
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
    }));
    setView("loading");

    try {
      const result = await config.onSubmit(state.formData);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        result: result as Result,
      }));
      setView("success");
      config.onSuccess?.(result, state.formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "İşlem sırasında hata oluştu";
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: message,
      }));
      setView("error");
      if (error instanceof Error) {
        config.onError?.(error, state.formData);
      }
    }
  }, [config, runStepValidation, state.formData]);

  const reset = useCallback(() => {
    setState({
      isOpen: false,
      currentStep: 0,
      formData: { ...defaultFormData, ...initialData },
      validationErrors: {},
      isSubmitting: false,
      isLoading: false,
      error: null,
      result: null,
    });
    setView("form");
    setCurrentField(undefined);
  }, [defaultFormData, initialData]);

  return {
    state,
    view,
    activeStep,
    currentField,
    setCurrentField,
    isOpen: state.isOpen,
    openModal,
    closeModal,
    currentStep: state.currentStep,
    nextStep,
    prevStep,
    formData: state.formData,
    updateFormData,
    validationErrors: state.validationErrors,
    submit,
    isSubmitting: state.isSubmitting,
    error: state.error,
    reset,
  };
}

function defaultStepValidation(
  step: FormStep,
  formData: Record<string, unknown>
) {
  const errors: Record<string, string> = {};

  step.fields.forEach((field) => {
    if (!field.required) return;
    const value = formData[field.id];
    const isEmpty =
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (isEmpty) {
      errors[field.id] = `${field.label} alanı zorunludur.`;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function buildDefaultFormData(formSteps: FormStep[]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  formSteps.forEach((step) => {
    step.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.id] = Array.isArray(field.defaultValue)
          ? [...field.defaultValue]
          : field.defaultValue;
        return;
      }

      if (field.type === "cards" && field.multiple) {
        defaults[field.id] = [];
      }
    });
  });

  return defaults;
}
