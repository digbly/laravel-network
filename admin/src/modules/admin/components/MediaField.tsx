import { type FC, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { MediaPickerModal } from '../../../app/media/components/MediaPickerModal';
import { useGetMediaByIdQuery } from '../../../store/services/mediaApi';

interface MediaFieldProps {
  label: string;
  value: string | null;
  onChange: (id: string | null) => void;
}

export const MediaField: FC<MediaFieldProps> = ({ label, value, onChange }) => {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { data, isFetching } = useGetMediaByIdQuery(value ?? '', { skip: !value });
  const media = data?.data;
  const preview = media?.thumb_url ?? media?.medium_url ?? media?.url ?? null;

  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
        {label}
      </span>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-center overflow-hidden shrink-0">
          {value && preview ? (
            <img src={preview} alt={media?.alt ?? label} className="w-full h-full object-cover" />
          ) : value && isFetching ? (
            <span className="text-[10px] text-slate-400">{t('admin:settings.branding.loading')}</span>
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPickerOpen(true)}
            leftIcon={<ImageIcon className="w-4 h-4" />}
          >
            {value ? t('admin:settings.branding.change') : t('admin:settings.branding.choose')}
          </Button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
              leftIcon={<X className="w-4 h-4" />}
            >
              {t('admin:settings.branding.remove')}
            </Button>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(item) => {
          onChange(item.id);
          setIsPickerOpen(false);
        }}
      />
    </div>
  );
};
