import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Loader2, Plus, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useGetMenuBoxItemsQuery } from '../../../store/services/menuApi';
import type { MenuBox, MenuItem } from '../../../types/menu';

interface MenuBoxAccordionProps {
  box: MenuBox;
  onAddItems: (items: MenuItem[]) => void;
}

let tempCounter = 0;

const makeTempId = (): string => `new-${Date.now()}-${(tempCounter += 1)}`;

export const MenuBoxAccordion = ({ box, onAddItems }: MenuBoxAccordionProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'latest' | 'search'>('latest');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput.trim()), 400);

    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const { data, isFetching } = useGetMenuBoxItemsQuery(
    { box: box.key, q: activeTab === 'search' ? search || undefined : undefined },
    { skip: !isOpen },
  );

  const items = data?.results ?? [];

  const switchTab = (tab: 'latest' | 'search') => {
    setActiveTab(tab);
    setSelectedIds([]);
  };

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((previous) =>
      checked ? [...previous, id] : previous.filter((value) => value !== id),
    );
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const handleAdd = () => {
    const selected = items.filter((item) => selectedIds.includes(String(item.id)));

    if (selected.length === 0) return;

    onAddItems(
      selected.map((item) => ({
        id: makeTempId(),
        label: item.text,
        link: '',
        target: '_self',
        is_custom: false,
        box_key: box.key,
        menuable_id: String(item.id),
        menuable_type: item.menuable_class ?? null,
        menuable_class_name: item.menuable_class_name ?? null,
        children: [],
      })),
    );

    setSelectedIds([]);
  };

  return (
    <div className="bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-white/[0.07] rounded-2xl mb-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/60 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
      >
        <span className="font-medium text-slate-700 dark:text-slate-200">{box.label}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="flex gap-4 border-b border-slate-100 dark:border-white/[0.06] mb-4">
            {(['latest', 'search'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchTab(tab)}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {t(`admin:menus.boxes.${tab}`)}
              </button>
            ))}
          </div>

          {activeTab === 'search' && (
            <div className="mb-4">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('admin:menus.boxes.searchPlaceholder')}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
            {isFetching ? (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('admin:menus.boxes.loading')}</span>
              </div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-lg px-1 py-1.5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(String(item.id))}
                    onChange={(event) => toggleSelected(String(item.id), event.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{item.text}</span>
                </label>
              ))
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                {t('admin:menus.boxes.empty')}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => setSelectedIds(event.target.checked ? items.map((item) => String(item.id)) : [])}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {t('admin:menus.boxes.selectAll')}
              </span>
            </label>

            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={selectedIds.length === 0}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {t('admin:menus.boxes.addToMenu')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
