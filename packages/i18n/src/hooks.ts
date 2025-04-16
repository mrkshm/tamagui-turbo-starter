import { useTranslation as useI18nextTranslation, Trans as I18nextTrans, UseTranslationResponse } from 'react-i18next';

/**
 * Wrapper around react-i18next's useTranslation hook.
 * This allows you to swap out the underlying i18n library in the future,
 * or add custom logic (e.g., logging, fallback handling) here.
 */
export function useTranslation(ns?: string | string[]): UseTranslationResponse<string, undefined> {
  // Add custom logic here if needed
  return useI18nextTranslation(ns);
}

/**
 * Wrapper around react-i18next's Trans component.
 * Allows for future replacement or customization.
 */
export const Trans = I18nextTrans;
