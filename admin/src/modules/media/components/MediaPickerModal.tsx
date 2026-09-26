import { useEffect, useState, type FC } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useGetMediaQuery } from '../../../store/services/mediaApi';
import type { AdminMedia } from '../../../types/media';
import { MediaGrid } from './MediaGrid';
import { MediaUploader } from './MediaUploader';
import { Pagination } from './Pagination';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: AdminMedia) => void;
}

const PER_PAGE = 18;

export const MediaPickerModal: FC<MediaPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminMedia | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setPage(1);
      setSearchInput('');
      setSearch('');
      setSelected(null);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const { data, isFetching } = useGetMediaQuery(
    { page, per_page: PER_PAGE, type: 'image', search: search || undefined },
    { skip: !isOpen },
  );

  const items = data?.data ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.media.picker.title')}
      description={t('admin.media.picker.subtitle')}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        <MediaUploader accept="image/*" onUploaded={(uploaded) => setSelected(uploaded[0] ?? null)} />

        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t('admin.media.filters.searchPlaceholder')}
          leftIcon={<Search className="w-4 h-4" />}
        />

        {isFetching && items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
            {t('admin.media.loading')}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
            {t('admin.media.picker.empty')}
          </p>
        ) : (
          <MediaGrid items={items} onOpen={setSelected} selectedId={selected?.id ?? null} />
        )}

        <Pagination meta={data?.meta} isFetching={isFetching} onPageChange={setPage} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('admin.media.deleteDialog.cancel')}
          </Button>
          <Button
            type="button"
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
          >
            {t('admin.media.picker.use')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
