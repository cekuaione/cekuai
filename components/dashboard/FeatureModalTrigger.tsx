"use client";

import { cloneElement, useCallback, useMemo, useState } from "react";
import type { MouseEvent, ReactElement } from "react";

import type { FeatureModalConfig } from "@/lib/types/modal";
import { FeatureModal } from "@/components/dashboard/FeatureModal";

export type TriggerElement = ReactElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void }>;

export interface FeatureModalTriggerProps {
  config: FeatureModalConfig;
  children: TriggerElement;
  initialData?: Record<string, unknown>;
  onSuccess?: (result: unknown, data: Record<string, unknown>) => void;
  onError?: (error: Error, data: Record<string, unknown>) => void;
}

export function FeatureModalTrigger({
  config,
  children,
  initialData,
  onSuccess,
  onError,
}: FeatureModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const trigger = useMemo(() => {
    const handleClick = (event: MouseEvent<HTMLElement>) => {
      if (typeof children.props.onClick === "function") {
        children.props.onClick(event);
      }
      if (!event.defaultPrevented) {
        openModal();
      }
    };

    return cloneElement(children, { onClick: handleClick });
  }, [children, openModal]);

  const mergedConfig = useMemo<FeatureModalConfig>(() => {
    return {
      ...config,
      onSubmit: config.onSubmit,
      onSuccess: (result: unknown, data: Record<string, unknown>) => {
        config.onSuccess?.(result, data);
        setIsOpen(false);
        onSuccess?.(result, data);
      },
      onError: (error: Error, data: Record<string, unknown>) => {
        config.onError?.(error, data);
        onError?.(error, data);
      },
    };
  }, [config, onError, onSuccess, setIsOpen]);

  return (
    <>
      {trigger}
      <FeatureModal
        config={mergedConfig}
        initialData={initialData}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </>
  );
}

export default FeatureModalTrigger;
