import i18n from 'i18next';
import type { BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1';

type TranslationTree = Record<string, unknown>;

/**
 * The backend returns every namespace in a single response, so the request is
 * made once per language and each namespace is served from the cache.
 */
const requestsByLanguage = new Map<string, Promise<TranslationTree>>();

const loadTranslations = (language: string): Promise<TranslationTree> => {
  const pending = requestsByLanguage.get(language);

  if (pending) {
    return pending;
  }

  const request = fetch(`${apiBaseUrl}/translations/${language}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to load translations for "${language}" (${response.status})`
        );
      }

      return response.json() as Promise<TranslationTree>;
    })
    .catch((error) => {
      requestsByLanguage.delete(language);

      throw error;
    });

  requestsByLanguage.set(language, request);

  return request;
};

const translationBackend: BackendModule = {
  type: 'backend',
  init() {
    // No backend options to initialise.
  },
  read(language, namespace, callback) {
    loadTranslations(language)
      .then((tree) => {
        const resource = tree[namespace] ?? {};
        callback(null, resource as Record<string, unknown>);
      })
      .catch((error: Error) => callback(error, null));
  },
};

i18n
  .use(translationBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi'],
    load: 'languageOnly',
    ns: ['common', 'admin', 'auth', 'blog', 'network'],
    defaultNS: 'common',
    fallbackNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
  })
  .catch((error) => {
    console.error('Failed to initialise i18n', error);
  });

export default i18n;
