import { useEffect, useMemo, useState } from 'react';

import {
  detectDeviceLanguage,
  getParentSettings,
  subscribeParentSettings,
} from '../engine/ParentSettingsManager';
import type { AppLanguage, TeacherPromptMode } from './types';
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
  const [language, setLanguage] = useState<AppLanguage>(() => detectDeviceLanguage());

  useEffect(() => {
    let isMounted = true;

    getParentSettings()
      .then(settings => {
        if (isMounted) {
          setLanguage(settings?.appLanguage || detectDeviceLanguage());
        }
      })
      .catch(() => undefined);

    const unsubscribe = subscribeParentSettings(settings => {
      if (isMounted) {
        setLanguage(settings.appLanguage || detectDeviceLanguage());
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return language || detectDeviceLanguage();
}

export function useSavedTeacherPromptMode() {
  const [mode, setMode] = useState<TeacherPromptMode>('vi');

  useEffect(() => {
    let isMounted = true;

    getParentSettings()
      .then(settings => {
        if (isMounted) {
          setMode(settings?.teacherPromptMode || 'vi');
        }
      })
      .catch(() => undefined);

    const unsubscribe = subscribeParentSettings(settings => {
      if (isMounted) {
        setMode(settings.teacherPromptMode || 'vi');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return mode || 'vi';
}

export function useSavedPromptLanguage(): AppLanguage {
  const appLanguage = useSavedAppLanguage();
  const teacherPromptMode = useSavedTeacherPromptMode();

  if (teacherPromptMode === 'en') {
    return 'en';
  }
  if (teacherPromptMode === 'vi') {
    return 'vi';
  }
  return appLanguage;
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
