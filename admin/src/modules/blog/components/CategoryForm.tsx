import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import type {
  AdminCategory,
  CategoryPayload,
  CategoryTranslation,
} from '../../../types/blog';

const LOCALES = ['en', 'vi'] as const;

interface TranslationDraft {
  name: string;
  slug: string;
  description: string;
}

const emptyTranslation = (): TranslationDraft => ({ name: '', slug: '', description: '' });

const buildTranslations = (category: AdminCategory | null): Record<string, TranslationDraft> => {
  const drafts: Record<string, TranslationDraft> = {};

  LOCALES.forEach((locale) => {
    const existing = category?.translations.find((translation) => translation.locale === locale);
    drafts[locale] = existing
      ? {
          name: existing.name ?? '',
          slug: existing.slug ?? '',
          description: existing.description ?? '',
        }
      : emptyTranslation();
  });

  return drafts;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface CategoryFormProps {
  category: AdminCategory | null;
  categories: AdminCategory[];
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (payload: CategoryPayload) => void;
  onCancel: () => void;
}

export const CategoryForm = ({
  category,
  categories,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: CategoryFormProps) => {
  const { t } = useTranslation();

  const [parentId, setParentId] = useState<string>(category?.parent_id ?? '');
  const [isHome, setIsHome] = useState(category?.is_home ?? false);
  const [translations, setTranslations] = useState<Record<string, TranslationDraft>>(() =>
    buildTranslations(category)
  );
  const [activeLocale, setActiveLocale] = useState<string>(LOCALES[0]);
  const [localError, setLocalError] = useState<string | null>(null);

  const updateTranslation = (locale: string, field: keyof TranslationDraft, value: string) => {
    setTranslations((current) => ({
      ...current,
      [locale]: { ...current[locale], [field]: value },
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    const payload: CategoryTranslation[] = LOCALES.map((locale) => {
      const draft = translations[locale];
      const slug = draft.slug.trim() || slugify(draft.name);

      return {
        locale,
        name: draft.name.trim(),
        slug,
        description: draft.description.trim() || null,
      };
    }).filter((translation) => translation.name !== '');

    if (payload.length === 0) {
      setLocalError(t('admin.blog.categories.form.nameRequired', { locale: LOCALES[0].toUpperCase() }));
      return;
    }

    onSubmit({
      parent_id: parentId || null,
      is_home: isHome,
      translations: payload,
    });
  };

  const active = translations[activeLocale] ?? emptyTranslation();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(error || localError) && <ErrorAlert message={error ?? localError ?? ''} />}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {t('admin.blog.categories.form.parent')}
        </label>
        <select
          value={parentId}
          onChange={(event) => setParentId(event.target.value)}
          className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="">{t('admin.blog.categories.form.noParent')}</option>
          {categories
            .filter((option) => option.id !== category?.id)
            .map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
        </select>
      </div>

      <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={isHome}
          onChange={(event) => setIsHome(event.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        {t('admin.blog.categories.form.isHome')}
      </label>

      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {t('admin.blog.categories.form.locale')}
        </span>
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] w-fit">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => setActiveLocale(locale)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors ${
                activeLocale === locale
                  ? 'bg-white dark:bg-[#0F1626] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {locale}
            </button>
          ))}
        </div>
      </div>

      <Input
        label={t('admin.blog.categories.form.name')}
        value={active.name}
        placeholder={t('admin.blog.categories.form.namePlaceholder')}
        onChange={(event) => updateTranslation(activeLocale, 'name', event.target.value)}
      />

      <Input
        label={t('admin.blog.categories.form.slug')}
        value={active.slug}
        placeholder={t('admin.blog.categories.form.slugPlaceholder')}
        onChange={(event) => updateTranslation(activeLocale, 'slug', event.target.value)}
      />

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {t('admin.blog.categories.form.description')}
        </label>
        <textarea
          value={active.description}
          rows={3}
          onChange={(event) => updateTranslation(activeLocale, 'description', event.target.value)}
          className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t('admin.blog.categories.form.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {category ? t('admin.blog.categories.form.save') : t('admin.blog.categories.form.create')}
        </Button>
      </div>
    </form>
  );
};
