import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from './resources';

// i18next will use all namespaces and languages discovered in locales/

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  ns: Object.keys(resources['en'] || {}),
  defaultNS: Object.keys(resources['en'] || {})[0] || 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
