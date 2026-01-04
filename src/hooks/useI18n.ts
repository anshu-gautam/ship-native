import { useUserStore } from '@/store';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useI18n = () => {
  const { t, i18n } = useTranslation();
  const { preferences, setLanguage } = useUserStore();

  useEffect(() => {
    if (preferences.language !== i18n.language) {
      i18n.changeLanguage(preferences.language);
    }
  }, [preferences.language, i18n]);

  const changeLanguage = async (language: string): Promise<void> => {
    await i18n.changeLanguage(language);
    setLanguage(language);
  };

  return {
    t,
    language: i18n.language,
    changeLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
};
