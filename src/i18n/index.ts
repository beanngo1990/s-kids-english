import { useEffect, useMemo, useState } from 'react';

import { getParentSettings } from '../engine/ParentSettingsManager';
import type { AppLanguage } from './types';
import { en } from './dictionaries/en';
import {
  vi,
  type TranslationDictionary,
  type TranslationKey,
} from './dictionaries/vi';

type TranslationParams = Record<string, number | string | undefined>;

export type Translator = (
  key: TranslationKey,
  params?: TranslationParams,
) => string;

const dictionaries = {
  en,
  vi,
} satisfies Record<AppLanguage, TranslationDictionary>;

export function translate(
  language: AppLanguage,
  key: TranslationKey,
  params?: TranslationParams,
) {
  const dict = dictionaries[language] ?? vi;
  const template = dict[key] ?? vi[key] ?? key;
  return interpolate(template, params);
}

export function createTranslator(language: AppLanguage): Translator {
  return (key, params) => translate(language || 'vi', key, params);
}

export function useTranslations(language: AppLanguage): Translator {
  return useMemo(() => createTranslator(language), [language]);
}

export function useSavedAppLanguage() {
  const [language, setLanguage] = useState<AppLanguage>('vi');

  useEffect(() => {
    let isMounted = true;

    getParentSettings()
      .then(settings => {
        if (isMounted) {
          setLanguage(settings?.appLanguage || 'vi');
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return language || 'vi';
}

export function useSavedTranslations() {
  return useTranslations(useSavedAppLanguage());
}

export const useI18n = useSavedTranslations;

function interpolate(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}
