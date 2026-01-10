import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './locales/ar.json';
import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  ar: { translation: ar },
};

// Get device locale
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Initialize RTL support
const initRTL = (language: string): void => {
  const isRTL = RTL_LANGUAGES.includes(language);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false,
  },
});

// Set initial RTL direction
initRTL(deviceLanguage);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  initRTL(lng);
});

export default i18n;
