import type { FC, ReactNode } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  isLoading?: boolean;
  variant?: 'primary' | 'danger';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isLoading = false,
  variant = 'primary',
  onConfirm,
  onClose,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
    <div className="mt-6 flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button type="button" variant={variant} onClick={onConfirm} isLoading={isLoading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);
