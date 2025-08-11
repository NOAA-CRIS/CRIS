// Framework and third-party non-ui
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Hooks, context, and constants
import enTranslations from '../constants/locales/en.json';

// App components

// Component specific modules (Component-styled, etc.)

// Third-party components (buttons, icons, etc.)

i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: {
                ...enTranslations,
            },
        },
    },
    lng: 'en',
    interpolation: {
        escapeValue: false, // react already safes from xss
    },
});

export default i18n;
