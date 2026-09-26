import { useState, type FC } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { useUpdateMediaMutation } from '../../../store/services/mediaApi';
import { getErrorMessage } from '../../../utils/apiError';
import type { AdminMedia } from '../../../types/media';

interface MediaDetailsModalProps {
  media: AdminMedia | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (item: AdminMedia) => void;
  onDelete: (item: AdminMedia) => void;
}

interface Draft {
  title: string;
  alt: string;
  caption: string;
  description: string;
}

const buildDraft = (media: AdminMedia | null): Draft => ({
  title: media?.title ?? '',
  alt: media?.alt ?? '',
  caption: media?.caption ?? '',
  description: media?.description ?? '',
});

export const MediaDetailsModal: FC<MediaDetailsModalProps> = ({
  media,
  isOpen,
  onClose,
  onSaved,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Draft>(() => buildDraft(media));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [trackedId, setTrackedId] = useState<string | null>(media?.id ?? null);
  const [updateMedia, { isLoading }] = useUpdateMediaMutation();

  const currentId = media?.id ?? null;

  if (currentId !== trackedId) {
    setTrackedId(currentId);
    setDraft(buildDraft(media));
    setError(null);
    setCopied(false);
  }

  const update = (field: keyof Draft, value: string): void =>
    setDraft((current) => ({ ...current, [field]: value }));

  const handleSave = async (): Promise<void> => {
    if (!media) return;

    setError(null);

    try {
      const result = await updateMedia({
        id: media.id,
        body: {
          title: draft.title || null,
          alt: draft.alt || null,
          caption: draft.caption || null,
          description: draft.description || null,
        },
      }).unwrap();
      onSaved(result.data);
      onClose();
    } catch (saveError) {
      setError(getErrorMessage(saveError, t('admin.media.errors.saveFailed')));
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (!media?.url) return;

    try {
      await navigator.clipboard.writeText(media.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t('admin.media.errors.copyFailed'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.media.details.title')}
      maxWidth="4xl"
    >
      {media && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center min-h-[240px]">
              {media.is_image && media.url ? (
                <img
                  src={media.url}
                  alt={draft.alt || draft.title}
                  className="max-h-[360px] w-auto object-contain"
                />
              ) : media.url ? (
                <a
                  href={media.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400"
                >
                  <ExternalLink className="w-6 h-6" />
                  {t('admin.media.details.openInNewTab')}
                </a>
              ) : (
                <span className="text-sm text-slate-400">
                  {t('admin.media.details.previewUnavailable')}
                </span>
              )}
            </div>

            <dl className="text-xs space-y-1.5">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t('admin.media.details.meta.file')}</dt>
                <dd className="text-slate-700 dark:text-slate-200 font-medium truncate">
                  {media.file_name ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t('admin.media.details.meta.type')}</dt>
                <dd className="text-slate-700 dark:text-slate-200 font-medium">
                  {media.mime_type ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t('admin.media.details.meta.size')}</dt>
                <dd className="text-slate-700 dark:text-slate-200 font-medium">
                  {media.size_formatted ?? '—'}
                </dd>
              </div>
              {media.is_image && media.width && media.height && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t('admin.media.details.meta.dimensions')}
                  </dt>
                  <dd className="text-slate-700 dark:text-slate-200 font-medium">
                    {media.width} × {media.height}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t('admin.media.details.meta.uploaded')}</dt>
                <dd className="text-slate-700 dark:text-slate-200 font-medium">
                  {media.created_at ? new Date(media.created_at).toLocaleString() : '—'}
                </dd>
              </div>
            </dl>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {t('admin.media.details.meta.url')}
              </span>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={media.url ?? ''}
                  onFocus={(event) => event.target.select()}
                  className="flex-1 min-w-0 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopy()}
                  leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? t('admin.media.details.copied') : t('admin.media.details.copyUrl')}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {error && <ErrorAlert message={error} />}

            <Input
              label={t('admin.media.details.fields.title')}
              value={draft.title}
              onChange={(event) => update('title', event.target.value)}
            />
            <Input
              label={t('admin.media.details.fields.alt')}
              value={draft.alt}
              onChange={(event) => update('alt', event.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {t('admin.media.details.fields.caption')}
              </label>
              <textarea
                rows={2}
                value={draft.caption}
                onChange={(event) => update('caption', event.target.value)}
                className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {t('admin.media.details.fields.description')}
              </label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(event) => update('description', event.target.value)}
                className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="danger"
                onClick={() => onDelete(media)}
                disabled={isLoading}
              >
                {t('admin.media.details.delete')}
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  {t('admin.media.deleteDialog.cancel')}
                </Button>
                <Button type="button" onClick={() => void handleSave()} isLoading={isLoading}>
                  {t('admin.media.details.save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
