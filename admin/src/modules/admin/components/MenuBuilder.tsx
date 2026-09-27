import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronLeft, ChevronRight, GripVertical, Trash2 } from 'lucide-react';
import type { FlatMenuItem, MenuItem } from '../../../types/menu';

const INDENT_STEP = 24;
const MAX_DEPTH = 2;

const levelBorder = [
  'border-l-4 border-l-indigo-500',
  'border-l-4 border-l-emerald-500',
  'border-l-4 border-l-amber-500',
];

const levelBadge = [
  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
];

const clampDepth = (depth: number): number => Math.max(0, Math.min(MAX_DEPTH, depth));

const flattenTree = (items: MenuItem[], depth = 0): FlatMenuItem[] =>
  items.reduce<FlatMenuItem[]>((result, item) => {
    const { children, ...rest } = item;
    result.push({ ...rest, children: [], depth });

    if (children && children.length > 0) {
      result = result.concat(flattenTree(children, depth + 1));
    }

    return result;
  }, []);

const buildTree = (flatItems: FlatMenuItem[]): MenuItem[] => {
  const root: MenuItem[] = [];
  const lastActiveAtDepth: Record<number, MenuItem> = {};

  for (const item of flatItems) {
    const node: MenuItem = {
      id: item.id,
      label: item.label,
      link: item.link,
      target: item.target,
      is_custom: item.is_custom,
      box_key: item.box_key,
      menuable_id: item.menuable_id,
      menuable_type: item.menuable_type,
      menuable_class_name: item.menuable_class_name,
      children: [],
    };

    if (item.depth === 0) {
      root.push(node);

      lastActiveAtDepth[0] = node;
    } else {
      const parent = lastActiveAtDepth[item.depth - 1];

      if (parent) {
        parent.children.push(node);
      } else {
        root.push(node);
      }

      lastActiveAtDepth[item.depth] = node;
    }
  }

  return root;
};

const normalizeDepths = (list: FlatMenuItem[]): FlatMenuItem[] => {
  let previousDepth = -1;

  return list.map((item, index) => {
    let depth = clampDepth(item.depth ?? 0);

    if (index === 0) {
      depth = 0;
    } else if (depth > previousDepth + 1) {
      depth = previousDepth + 1;
    }

    previousDepth = depth;

    return { ...item, depth };
  });
};

interface SortableMenuItemProps {
  item: FlatMenuItem;
  activeId: string | null;
  dragX: number;
  canIndent: boolean;
  canOutdent: boolean;
  onUpdate: (id: string, data: Partial<MenuItem>) => void;
  onRemove: (id: string) => void;
  onIndent: () => void;
  onOutdent: () => void;
}

const SortableMenuItem = ({
  item,
  activeId,
  dragX,
  canIndent,
  canOutdent,
  onUpdate,
  onRemove,
  onIndent,
  onOutdent,
}: SortableMenuItemProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const currentDepth = useMemo(() => {
    if (isDragging && item.id === activeId) {
      return clampDepth(item.depth + Math.round(dragX / INDENT_STEP));
    }

    return item.depth;
  }, [isDragging, item.id, activeId, item.depth, dragX]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${currentDepth * INDENT_STEP}px`,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-white/[0.07] rounded-xl mb-2 transition-all duration-200 shadow-sm ${
        levelBorder[currentDepth] ?? 'border-l-4 border-l-slate-200'
      }`}
    >
      <div
        className="flex items-center justify-between p-3 cursor-grab select-none"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
            {item.label}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              levelBadge[currentDepth] ?? 'bg-slate-500/10 text-slate-500'
            }`}
          >
            {t('admin.menus.builder.level', { level: currentDepth + 1 })}
          </span>
        </div>

        <div className="flex items-center gap-1" onPointerDown={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={onOutdent}
            disabled={!canOutdent}
            title={t('admin.menus.builder.outdent')}
            aria-label={t('admin.menus.builder.outdent')}
            className="p-1 text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onIndent}
            disabled={!canIndent}
            title={t('admin.menus.builder.indent')}
            aria-label={t('admin.menus.builder.indent')}
            className="p-1 text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1" />
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            aria-label={t('admin.menus.builder.toggle')}
            className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={t('admin.menus.builder.remove')}
            className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {t('admin.menus.builder.navigationLabel')}
            </label>
            <input
              type="text"
              value={item.label}
              onChange={(event) => onUpdate(item.id, { label: event.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {item.is_custom && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {t('admin.menus.builder.url')}
              </label>
              <input
                type="text"
                value={item.link ?? ''}
                onChange={(event) => onUpdate(item.id, { link: event.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {t('admin.menus.builder.target')}
            </label>
            <select
              value={item.target ?? '_self'}
              onChange={(event) => onUpdate(item.id, { target: event.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="_self">{t('admin.menus.builder.sameWindow')}</option>
              <option value="_blank">{t('admin.menus.builder.newWindow')}</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItemPreview = ({ item }: { item: FlatMenuItem }) => (
  <div
    style={{ marginLeft: `${item.depth * INDENT_STEP}px` }}
    className={`bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-white/[0.07] rounded-xl mb-2 shadow-lg opacity-90 cursor-grabbing ${
      levelBorder[item.depth] ?? 'border-l-4 border-l-slate-200'
    }`}
  >
    <div className="flex items-center gap-3 p-3">
      <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{item.label}</span>
    </div>
  </div>
);

interface MenuBuilderProps {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
}

export const MenuBuilder = ({ items, onChange }: MenuBuilderProps) => {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const flatItems = useMemo(() => flattenTree(items), [items]);

  const activeItem = useMemo(
    () => (activeId ? flatItems.find((item) => item.id === activeId) ?? null : null),
    [activeId, flatItems],
  );

  const activePreview = useMemo(
    () =>
      activeItem
        ? { ...activeItem, depth: clampDepth(activeItem.depth + Math.round(dragX / INDENT_STEP)) }
        : null,
    [activeItem, dragX],
  );

  const commit = (list: FlatMenuItem[]) => onChange(buildTree(normalizeDepths(list)));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setDragX(0);
  };

  const handleDragMove = (event: DragMoveEvent) => setDragX(event.delta.x);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);
    setDragX(0);

    if (!over) return;

    const oldIndex = flatItems.findIndex((item) => item.id === active.id);
    const newIndex = flatItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const moved = arrayMove(flatItems, oldIndex, newIndex).map((item) =>
      item.id === active.id
        ? { ...item, depth: clampDepth(item.depth + Math.round(delta.x / INDENT_STEP)) }
        : item,
    );

    commit(moved);
  };

  const handleUpdate = (id: string, data: Partial<MenuItem>) => {
    commit(flatItems.map((item) => (item.id === id ? { ...item, ...data } : item)));
  };

  const handleRemove = (id: string) => commit(flatItems.filter((item) => item.id !== id));

  const handleIndent = (index: number) => {
    const updated = [...flatItems];
    updated[index] = { ...updated[index], depth: updated[index].depth + 1 };
    commit(updated);
  };

  const handleOutdent = (index: number) => {
    const updated = [...flatItems];
    updated[index] = { ...updated[index], depth: updated[index].depth - 1 };
    commit(updated);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setDragX(0);
      }}
    >
      <div className="space-y-2">
        <SortableContext
          items={flatItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {flatItems.map((item, index) => {
            const previousDepth = index > 0 ? flatItems[index - 1].depth : -1;

            return (
              <SortableMenuItem
                key={item.id}
                item={item}
                activeId={activeId}
                dragX={dragX}
                canIndent={item.depth < MAX_DEPTH && item.depth <= previousDepth}
                canOutdent={item.depth > 0}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                onIndent={() => handleIndent(index)}
                onOutdent={() => handleOutdent(index)}
              />
            );
          })}
        </SortableContext>

        <DragOverlay>
          {activePreview ? <MenuItemPreview item={activePreview} /> : null}
        </DragOverlay>

        {flatItems.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl text-sm text-slate-500 dark:text-slate-400">
            {t('admin.menus.builder.empty')}
          </div>
        )}
      </div>
    </DndContext>
  );
};
