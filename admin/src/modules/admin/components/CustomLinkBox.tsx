import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { MenuItem } from '../../../types/menu';

interface CustomLinkBoxProps {
  onAddItems: (items: MenuItem[]) => void;
}

let tempCounter = 0;

export const CustomLinkBox = ({ onAddItems }: CustomLinkBoxProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [link, setLink] = useState('');

  const handleAdd = () => {
    if (!label.trim() || !link.trim()) return;

    onAddItems([
      {
        id: `new-${Date.now()}-custom-${(tempCounter += 1)}`,
        label,
        link,
        target: '_self',
        is_custom: true,
        box_key: 'custom',
        menuable_id: null,
        menuable_type: null,
        menuable_class_name: null,
        children: [],
      },
    ]);

    setLabel('');
    setLink('');
  };

  return (
    <div className="bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-white/[0.07] rounded-2xl mb-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/60 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
      >
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {t('admin:menus.customLink.title')}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] space-y-4">
          <Input
            label={t('admin:menus.customLink.url')}
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://"
          />

          <Input
            label={t('admin:menus.customLink.label')}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={t('admin:menus.customLink.labelPlaceholder')}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!label.trim() || !link.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {t('admin:menus.customLink.addToMenu')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
