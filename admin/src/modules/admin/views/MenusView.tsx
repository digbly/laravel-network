import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Menu as MenuIcon,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import {
  useCreateMenuMutation,
  useDeleteMenuMutation,
  useGetMenuBoxesQuery,
  useGetMenuLocationsQuery,
  useGetMenuQuery,
  useGetMenusQuery,
  useUpdateMenuMutation,
} from '../../../store/services/menuApi';
import { getErrorMessage } from '../../../utils/apiError';
import type { AdminMenu, MenuBox, MenuItem, MenuLocationsResponse, MenuPayload } from '../../../types/menu';
import { CustomLinkBox } from '../components/CustomLinkBox';
import { MenuBoxAccordion } from '../components/MenuBoxAccordion';
import { MenuBuilder } from '../components/MenuBuilder';

type Notice = { type: 'success' | 'error'; message: string };

const isTempId = (id: string): boolean => id.startsWith('new-');

const serializeItems = (items: MenuItem[]): unknown[] =>
  items.map((item) => {
    const payload: Record<string, unknown> = {
      label: item.label,
      target: item.target ?? '_self',
      children: serializeItems(item.children ?? []),
    };

    if (!isTempId(item.id)) {
      payload.id = item.id;
    }

    if (item.is_custom) {
      payload.is_custom = 1;
      payload.link = item.link ?? '';
    } else {
      payload.key = item.box_key;
      payload.menuable_id = item.menuable_id;
    }

    return payload;
  });

const resolveSelectedLocations = (
  menuId: string,
  locations?: MenuLocationsResponse,
): string[] =>
  Object.entries(locations?.selected ?? {})
    .filter(([, assignedMenuId]) => assignedMenuId === menuId)
    .map(([location]) => location);

interface MenuEditorProps {
  menu: AdminMenu;
  boxes: MenuBox[];
  locations?: MenuLocationsResponse;
  onNotice: (notice: Notice) => void;
  onDeleted: () => void;
}

const MenuEditor = ({ menu, boxes, locations, onNotice, onDeleted }: MenuEditorProps) => {
  const { t, i18n } = useTranslation();

  const [name, setName] = useState(menu.name);
  const [items, setItems] = useState<MenuItem[]>(menu.items ?? []);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() =>
    resolveSelectedLocations(menu.id, locations),
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [updateMenu, updateState] = useUpdateMenuMutation();
  const [deleteMenu, deleteState] = useDeleteMenuMutation();

  const handleSave = async () => {
    const body: MenuPayload = {
      name,
      content: JSON.stringify(serializeItems(items)),
      locale: i18n.resolvedLanguage?.split('-')[0],
    };

    // Only touch location assignments once the available locations are known,
    // otherwise a slow request could clear every location on save.
    if (locations) {
      body.location = selectedLocations;
    }

    try {
      await updateMenu({ id: menu.id, body }).unwrap();
      onNotice({ type: 'success', message: t('admin.menus.notices.updated') });
    } catch (error) {
      onNotice({
        type: 'error',
        message: getErrorMessage(error, t('admin.menus.errors.saveFailed')),
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMenu(menu.id).unwrap();
      onNotice({ type: 'success', message: t('admin.menus.notices.deleted') });
      onDeleted();
    } catch (error) {
      onNotice({
        type: 'error',
        message: getErrorMessage(error, t('admin.menus.errors.deleteFailed')),
      });
    } finally {
      setConfirmDelete(false);
    }
  };

  const toggleLocation = (key: string) => {
    setSelectedLocations((previous) =>
      previous.includes(key) ? previous.filter((value) => value !== key) : [...previous, key],
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
          {t('admin.menus.addItems')}
        </h3>

        {boxes.map((box) => (
          <MenuBoxAccordion
            key={box.key}
            box={box}
            onAddItems={(newItems) => setItems((previous) => [...previous, ...newItems])}
          />
        ))}

        <CustomLinkBox
          onAddItems={(newItems) => setItems((previous) => [...previous, ...newItems])}
        />
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardBody className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px]">
              <Input
                label={t('admin.menus.name')}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <Button
              onClick={() => void handleSave()}
              isLoading={updateState.isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {t('admin.menus.save')}
            </Button>
          </CardBody>

          <CardHeader title={t('admin.menus.structure')} />

          <CardBody className="bg-slate-50/50 dark:bg-white/[0.01]">
            <MenuBuilder items={items} onChange={setItems} />
          </CardBody>

          {(locations?.data.length ?? 0) > 0 && (
            <>
              <CardHeader title={t('admin.menus.settings')} />
              <CardBody className="space-y-2">
                {locations?.data.map((location) => (
                  <label key={location.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(location.key)}
                      onChange={() => toggleLocation(location.key)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {location.label}
                    </span>
                  </label>
                ))}
              </CardBody>
            </>
          )}

          <CardFooter className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
              className="text-rose-600 hover:text-rose-500 hover:bg-rose-500/10"
            >
              {t('admin.menus.delete')}
            </Button>

            <Button
              onClick={() => void handleSave()}
              isLoading={updateState.isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {t('admin.menus.save')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('admin.menus.deleteDialog.title')}
        description={t('admin.menus.deleteDialog.description', { name })}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            {t('admin.menus.deleteDialog.cancel')}
          </Button>
          <Button
            variant="danger"
            isLoading={deleteState.isLoading}
            onClick={() => void handleDelete()}
          >
            {t('admin.menus.deleteDialog.confirm')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export const MenusView = () => {
  const { t } = useTranslation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);

  const { data: menusData, isFetching: isMenusFetching } = useGetMenusQuery();
  const menus = menusData?.data ?? [];

  const activeId = selectedId ?? menus[0]?.id ?? null;

  const { data: menuData, isFetching: isMenuFetching } = useGetMenuQuery(activeId ?? '', {
    skip: !activeId,
  });
  const menu = menuData?.data;

  const { data: boxesData } = useGetMenuBoxesQuery();
  const boxes = boxesData?.data ?? [];

  const { data: locationsData } = useGetMenuLocationsQuery();

  const [createMenu, createState] = useCreateMenuMutation();

  useEffect(() => {
    if (notice?.type !== 'success') return;

    const handle = window.setTimeout(() => setNotice(null), 4000);

    return () => window.clearTimeout(handle);
  }, [notice]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newName.trim()) return;

    try {
      const response = await createMenu({ name: newName.trim() }).unwrap();
      setNewName('');
      setIsCreating(false);
      setSelectedId(response.data.id);
      setNotice({ type: 'success', message: t('admin.menus.notices.created') });
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, t('admin.menus.errors.saveFailed')),
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('admin.menus.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('admin.menus.subtitle')}
          </p>
        </div>

        <Button
          onClick={() => setIsCreating((value) => !value)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('admin.menus.createNew')}
        </Button>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border animate-in fade-in ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          {menus.length > 0 ? (
            <>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('admin.menus.selectMenu')}
              </span>
              <select
                value={activeId ?? ''}
                onChange={(event) => setSelectedId(event.target.value)}
                aria-label={t('admin.menus.selectMenu')}
                className="flex-1 max-w-sm px-3 py-2 text-sm bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {menus.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
              <span className="text-sm text-slate-500">{t('admin.menus.or')}</span>
              <button
                type="button"
                onClick={() => setIsCreating((value) => !value)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                {t('admin.menus.createNew')}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              {isMenusFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('admin.menus.loading')}</span>
                </>
              ) : (
                <span>{t('admin.menus.empty')}</span>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {isCreating && (
        <Card>
          <CardBody>
            <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[220px]">
                <Input
                  label={t('admin.menus.name')}
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder={t('admin.menus.namePlaceholder')}
                  required
                />
              </div>
              <Button
                type="submit"
                isLoading={createState.isLoading}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                {t('admin.menus.addMenu')}
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {activeId && isMenuFetching && !menu && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400 dark:text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">{t('admin.menus.loading')}</span>
        </div>
      )}

      {menu && (
        <MenuEditor
          key={`${menu.id}:${locationsData ? 'ready' : 'pending'}`}
          menu={menu}
          boxes={boxes}
          locations={locationsData}
          onNotice={setNotice}
          onDeleted={() => setSelectedId(null)}
        />
      )}

      {!activeId && !isMenusFetching && menus.length === 0 && (
        <Card>
          <CardBody className="py-16 text-center">
            <MenuIcon className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.menus.empty')}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
