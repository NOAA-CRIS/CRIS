import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import enTranslation from '../constants/translations/enTranslation';

i18n.use(Backend)
    .use(initReactI18next)
    .init({
        lng: 'en',
        fallbackLng: ['en'],
        resources: {
            en: {
                translation: {
                    ...enTranslation,
                },
            },
        },
        debug: false,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
