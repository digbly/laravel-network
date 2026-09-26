import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import type { AdminCategory, AdminPost, PostPayload, PostStatus, PostTranslation } from '../../../types/blog';

const LOCALES = ['en', 'vi'] as const;

interface TranslationDraft {
  title: string;
  slug: string;
  description: string;
  content: string;
}

const emptyTranslation = (): TranslationDraft => ({
  title: '',
  slug: '',
  description: '',
  content: '',
});

const buildTranslations = (post: AdminPost | null): Record<string, TranslationDraft> => {
  const drafts: Record<string, TranslationDraft> = {};

  LOCALES.forEach((locale) => {
    const existing = post?.translations.find((translation) => translation.locale === locale);
    drafts[locale] = existing
      ? {
          title: existing.title ?? '',
          slug: existing.slug ?? '',
          description: existing.description ?? '',
          content: existing.content ?? '',
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

interface PostFormProps {
  post: AdminPost | null;
  categories: AdminCategory[];
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (payload: PostPayload) => void;
  onCancel: () => void;
}

export const PostForm = ({
  post,
  categories,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: PostFormProps) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<PostStatus>(post?.status ?? 'draft');
  const [categoryIds, setCategoryIds] = useState<string[]>(
    post?.categories.map((category) => category.id) ?? []
  );
  const [translations, setTranslations] = useState<Record<string, TranslationDraft>>(() =>
    buildTranslations(post)
  );
  const [activeLocale, setActiveLocale] = useState<string>(LOCALES[0]);
  const [localError, setLocalError] = useState<string | null>(null);

  const updateTranslation = (locale: string, field: keyof TranslationDraft, value: string) => {
    setTranslations((current) => ({
      ...current,
      [locale]: { ...current[locale], [field]: value },
    }));
  };

  const toggleCategory = (id: string) => {
    setCategoryIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    const payload: PostTranslation[] = LOCALES.map((locale) => {
      const draft = translations[locale];
      const slug = draft.slug.trim() || slugify(draft.title);

      return {
        locale,
        title: draft.title.trim(),
        slug,
        description: draft.description.trim() || null,
        content: draft.content.trim() || null,
      };
    }).filter((translation) => translation.title !== '');

    if (payload.length === 0) {
      setLocalError(t('admin.blog.posts.form.titleRequired', { locale: LOCALES[0].toUpperCase() }));
      return;
    }

    onSubmit({
      status,
      categories: categoryIds,
      translations: payload,
    });
  };

  const active = translations[activeLocale] ?? emptyTranslation();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(error || localError) && <ErrorAlert message={error ?? localError ?? ''} />}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {t('admin.blog.posts.form.status')}
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as PostStatus)}
          className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="draft">{t('admin.blog.posts.filters.draft')}</option>
          <option value="published">{t('admin.blog.posts.filters.published')}</option>
        </select>
      </div>

      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {t('admin.blog.posts.form.locale')}
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
        label={t('admin.blog.posts.form.title')}
        value={active.title}
        placeholder={t('admin.blog.posts.form.titlePlaceholder')}
        onChange={(event) => updateTranslation(activeLocale, 'title', event.target.value)}
      />

      <Input
        label={t('admin.blog.posts.form.slug')}
        value={active.slug}
        placeholder={t('admin.blog.posts.form.slugPlaceholder')}
        onChange={(event) => updateTranslation(activeLocale, 'slug', event.target.value)}
      />

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {t('admin.blog.posts.form.description')}
        </label>
        <textarea
          value={active.description}
          rows={2}
          onChange={(event) => updateTranslation(activeLocale, 'description', event.target.value)}
          className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {t('admin.blog.posts.form.content')}
        </label>
        <textarea
          value={active.content}
          rows={12}
          onChange={(event) => updateTranslation(activeLocale, 'content', event.target.value)}
          className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {t('admin.blog.posts.form.categories')}
        </span>
        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('admin.blog.posts.form.noCategories')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-colors ${
                  categoryIds.includes(category.id)
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={categoryIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t('admin.blog.posts.form.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {post ? t('admin.blog.posts.form.save') : t('admin.blog.posts.form.create')}
        </Button>
      </div>
    </form>
  );
};
