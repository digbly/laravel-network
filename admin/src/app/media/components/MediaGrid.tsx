import type { FC } from 'react';
import { Copy, FileText, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminMedia } from '../../../types/media';

interface MediaGridProps {
  items: AdminMedia[];
  onOpen: (item: AdminMedia) => void;
  onDelete?: (item: AdminMedia) => void;
  onCopy?: (item: AdminMedia) => void;
  selectedId?: string | null;
}

const fileName = (item: AdminMedia): string => item.title || item.name || item.file_name || '';

const MediaTile: FC<{
  item: AdminMedia;
  onOpen: (item: AdminMedia) => void;
  onDelete?: (item: AdminMedia) => void;
  onCopy?: (item: AdminMedia) => void;
  isSelected: boolean;
}> = ({ item, onOpen, onDelete, onCopy, isSelected }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden border bg-slate-50 dark:bg-white/[0.03] transition-all ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/30'
          : 'border-slate-200 dark:border-white/[0.08] hover:border-indigo-400/60'
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="block w-full aspect-square focus:outline-none"
        title={t('admin.media.item.open')}
      >
        {item.is_image && (item.thumb_url || item.url) ? (
          <img
            src={item.thumb_url ?? item.url ?? ''}
            alt={item.alt ?? fileName(item)}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
            <FileText className="w-8 h-8" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {item.extension ?? 'file'}
            </span>
          </span>
        )}
      </button>

      {(onCopy || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {onCopy && (
            <button
              type="button"
              onClick={() => onCopy(item)}
              title={t('admin.media.item.copyUrl')}
              className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              title={t('admin.media.item.delete')}
              className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="px-2.5 py-2 border-t border-slate-100 dark:border-white/[0.06]">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
          {fileName(item)}
        </p>
        <p className="text-[10px] text-slate-400 truncate">{item.size_formatted ?? '—'}</p>
      </div>
    </div>
  );
};

export const MediaGrid: FC<MediaGridProps> = ({
  items,
  onOpen,
  onDelete,
  onCopy,
  selectedId = null,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
    {items.map((item) => (
      <MediaTile
        key={item.id}
        item={item}
        onOpen={onOpen}
        onDelete={onDelete}
        onCopy={onCopy}
        isSelected={selectedId === item.id}
      />
    ))}
  </div>
);
