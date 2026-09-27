import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  GripVertical,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { WidgetFormRenderer } from '../components/widgets/FormRenderer';
import {
  useGetWidgetsQuery,
  useUpdateSidebarWidgetsMutation,
} from '../../../store/services/widgetApi';
import { getErrorMessage } from '../../../utils/apiError';
import type {
  SidebarDefinition,
  SidebarWidgetItem,
  WidgetDefinition,
  WidgetIndexData,
  WidgetUpdatePayload,
} from '../../../types/widget';

type Notice = { type: 'success' | 'error'; message: string };

interface WidgetFormChange {
  label?: string;
  data?: Record<string, unknown>;
}

const generateTempKey = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const sortableId = (item: SidebarWidgetItem, index: number): string =>
  item._tempKey ?? item.id ?? String(index);

const buildItems = (index: WidgetIndexData): Record<string, SidebarWidgetItem[]> => {
  const result: Record<string, SidebarWidgetItem[]> = {};

  Object.entries(index.sidebar_widgets ?? {}).forEach(([sidebarKey, items]) => {
    result[sidebarKey] = items.map((item) => ({
      ...item,
      data: item.data ?? {},
      _tempKey: generateTempKey(),
    }));
  });

  return result;
};

interface SortableWidgetCardProps {
  item: SidebarWidgetItem;
  index: number;
  theme: string;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (patch: WidgetFormChange) => void;
}

const SortableWidgetCard = ({
  item,
  index,
  theme,
  expanded,
  onToggle,
  onRemove,
  onChange,
}: SortableWidgetCardProps) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId(item, index),
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0F1626] ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 p-3">
        <button
          type="button"
          className="flex flex-1 items-center gap-2 truncate text-left cursor-grab select-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {item.label}
          </span>
        </button>

        <div className="flex items-center gap-1" onPointerDown={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={onToggle}
            aria-label={t('admin.widgets.toggle')}
            className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 dark:border-white/[0.08] p-4 space-y-4">
          <WidgetFormRenderer
            theme={theme}
            widget={item.widget}
            label={item.label}
            data={item.data}
            onChange={onChange}
          />

          <div className="flex justify-end border-t border-slate-100 dark:border-white/[0.06] pt-3">
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-500 transition-colors"
            >
              <X className="w-4 h-4" />
              {t('admin.widgets.remove')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface WidgetsEditorProps {
  index: WidgetIndexData;
  onNotice: (notice: Notice) => void;
}

const WidgetsEditor = ({ index, onNotice }: WidgetsEditorProps) => {
  const { t, i18n } = useTranslation();

  const [sidebarItems, setSidebarItems] = useState<Record<string, SidebarWidgetItem[]>>(() =>
    buildItems(index),
  );
  const [openWidget, setOpenWidget] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const [updateSidebar] = useUpdateSidebarWidgetsMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const itemsFor = (sidebarKey: string): SidebarWidgetItem[] => sidebarItems[sidebarKey] ?? [];

  const handleAdd = (widget: WidgetDefinition, sidebarKey: string): void => {
    setSidebarItems((previous) => ({
      ...previous,
      [sidebarKey]: [
        ...(previous[sidebarKey] ?? []),
        {
          id: '',
          widget: widget.key,
          label: widget.label,
          data: {},
          _tempKey: generateTempKey(),
        },
      ],
    }));
    setOpenWidget(null);
  };

  const handleRemove = (sidebarKey: string, indexToRemove: number): void => {
    setSidebarItems((previous) => {
      const current = [...(previous[sidebarKey] ?? [])];
      current.splice(indexToRemove, 1);

      return { ...previous, [sidebarKey]: current };
    });
  };

  const handleChange = (
    sidebarKey: string,
    indexToChange: number,
    patch: WidgetFormChange,
  ): void => {
    setSidebarItems((previous) => {
      const current = [...(previous[sidebarKey] ?? [])];
      const target = current[indexToChange];

      if (!target) return previous;

      current[indexToChange] = {
        ...target,
        label: patch.label ?? target.label,
        data: patch.data ?? target.data,
      };

      return { ...previous, [sidebarKey]: current };
    });
  };

  const handleDragEnd = (event: DragEndEvent, sidebarKey: string): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSidebarItems((previous) => {
      const current = previous[sidebarKey] ?? [];
      const oldIndex = current.findIndex((item, i) => sortableId(item, i) === active.id);
      const newIndex = current.findIndex((item, i) => sortableId(item, i) === over.id);

      if (oldIndex === -1 || newIndex === -1) return previous;

      return { ...previous, [sidebarKey]: arrayMove(current, oldIndex, newIndex) };
    });
  };

  const handleSave = async (sidebar: SidebarDefinition): Promise<void> => {
    setProcessing(sidebar.key);

    const body: WidgetUpdatePayload = {
      locale: i18n.resolvedLanguage?.split('-')[0],
      content: itemsFor(sidebar.key).map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        widget: item.widget,
        label: item.label,
        data: item.data,
      })),
    };

    try {
      await updateSidebar({ sidebar: sidebar.key, body }).unwrap();
      onNotice({ type: 'success', message: t('admin.widgets.notices.saved') });
    } catch (error) {
      onNotice({
        type: 'error',
        message: getErrorMessage(error, t('admin.widgets.errors.saveFailed')),
      });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader title={t('admin.widgets.availableWidgets')} />
          <CardBody className="space-y-3">
            {index.widgets.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('admin.widgets.noWidgets')}
              </p>
            )}

            {index.widgets.map((widget) => {
              const sidebars = index.sidebars.filter(
                (sidebar) => widget.only.length === 0 || widget.only.includes(sidebar.key),
              );

              return (
                <div
                  key={widget.key}
                  className="rounded-xl border border-slate-200 dark:border-white/[0.08] overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-white/[0.02]">
                    <div className="min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {widget.label}
                      </h4>
                      {widget.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {widget.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={t('admin.widgets.addToSidebar')}
                      onClick={() => setOpenWidget(openWidget === widget.key ? null : widget.key)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openWidget === widget.key ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {openWidget === widget.key && (
                    <div className="p-3 space-y-2 border-t border-slate-200 dark:border-white/[0.08]">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('admin.widgets.addToSidebar')}
                      </p>
                      {sidebars.map((sidebar) => (
                        <button
                          key={sidebar.key}
                          type="button"
                          onClick={() => handleAdd(widget, sidebar.key)}
                          className="w-full rounded-lg border border-indigo-100 dark:border-indigo-500/30 px-3 py-2 text-left text-sm text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        >
                          {sidebar.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {index.sidebars.map((sidebar) => {
          const items = itemsFor(sidebar.key);

          return (
            <Card key={sidebar.key}>
              <CardHeader title={sidebar.label} subtitle={sidebar.description} />

              <CardBody>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, sidebar.key)}
                >
                  <SortableContext
                    items={items.map((item, i) => sortableId(item, i))}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="mb-4 min-h-[64px] space-y-3 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.1] p-3">
                      {items.length === 0 && (
                        <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                          {t('admin.widgets.noWidgetsInSidebar')}
                        </p>
                      )}

                      {items.map((item, i) => {
                        const key = sortableId(item, i);

                        return (
                          <SortableWidgetCard
                            key={key}
                            item={item}
                            index={i}
                            theme={index.theme}
                            expanded={!!expanded[`${sidebar.key}-${key}`]}
                            onToggle={() =>
                              setExpanded((previous) => ({
                                ...previous,
                                [`${sidebar.key}-${key}`]: !previous[`${sidebar.key}-${key}`],
                              }))
                            }
                            onRemove={() => handleRemove(sidebar.key, i)}
                            onChange={(patch) => handleChange(sidebar.key, i, patch)}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="flex justify-end">
                  <Button
                    onClick={() => void handleSave(sidebar)}
                    isLoading={processing === sidebar.key}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    {t('admin.widgets.save')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export const WidgetsView = () => {
  const { t } = useTranslation();

  const [notice, setNotice] = useState<Notice | null>(null);
  const { data, isFetching, fulfilledTimeStamp } = useGetWidgetsQuery();
  const index = data?.data;

  useEffect(() => {
    if (notice?.type !== 'success') return;

    const handle = window.setTimeout(() => setNotice(null), 4000);

    return () => window.clearTimeout(handle);
  }, [notice]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('admin.widgets.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('admin.widgets.subtitle')}
        </p>
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

      {index ? (
        <WidgetsEditor key={fulfilledTimeStamp} index={index} onNotice={setNotice} />
      ) : (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400 dark:text-slate-500">
          <Loader2 className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="text-sm">{t('admin.widgets.loading')}</span>
        </div>
      )}
    </div>
  );
};
