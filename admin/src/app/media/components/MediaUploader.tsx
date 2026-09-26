import { useRef, useState, type DragEvent, type FC } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { useUploadMediaMutation } from '../../../store/services/mediaApi';
import { getErrorMessage } from '../../../utils/apiError';
import type { AdminMedia } from '../../../types/media';

interface MediaUploaderProps {
  onUploaded?: (items: AdminMedia[]) => void;
  accept?: string;
}

export const MediaUploader: FC<MediaUploaderProps> = ({
  onUploaded,
  accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx',
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadMedia, { isLoading }] = useUploadMediaMutation();

  const handleFiles = async (fileList: FileList | null): Promise<void> => {
    const files = Array.from(fileList ?? []);

    if (files.length === 0) return;

    setError(null);
    setPendingCount(files.length);

    try {
      const result = await uploadMedia({ files }).unwrap();
      onUploaded?.(result.data);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, t('admin.media.errors.uploadFailed')));
    } finally {
      setPendingCount(0);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    void handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isLoading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !isLoading) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-slate-300 dark:border-white/[0.12] hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
        } ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />

        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('admin.media.dropzone.uploading', { count: pendingCount })}
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="w-6 h-6 text-slate-400" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('admin.media.dropzone.title')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('admin.media.dropzone.hint')}
            </p>
          </>
        )}
      </div>

      {error && <ErrorAlert message={error} />}
    </div>
  );
};
