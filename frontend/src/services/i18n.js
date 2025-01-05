import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esMessages from '../locales/es'; 
import enMessages from '../locales/en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enMessages,
      },
      es: {
        translation: esMessages,
      },
    },
    lng: 'es', 
    fallbackLng: 'es', 
    interpolation: {
      escapeValue: false, 
    },
});

export default i18n;
