import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { CustomizeControlField } from '../components/customize/CustomizeControlField';
import {
  useGetCustomizeQuery,
  useGetCustomizeWidgetsQuery,
  useUpdateCustomizeMutation,
} from '../../../store/services/customizeApi';
import { getErrorMessage } from '../../../utils/apiError';
import { websitePath } from '../../../utils/website';
import type {
  CustomizeIndexData,
  CustomizeItem,
  CustomizePanelDefinition,
  CustomizeSectionDefinition,
  CustomizeWidgetData,
  PageBlockItem,
} from '../../../types/customize';
import type { SidebarWidgetItem } from '../../../types/widget';

type Notice = { type: 'success' | 'error'; message: string };
type DeviceType = 'desktop' | 'tablet' | 'mobile';
type View = 'main' | 'panel' | 'section';

const isPanel = (item: CustomizeItem): item is CustomizePanelDefinition =>
  'childs' in item && item.childs !== undefined;

const toArray = <T,>(value: Record<string, T> | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : Object.values(value);

const sortByPriority = <T extends { priority?: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

const DEVICES: ReadonlyArray<[DeviceType, typeof Monitor]> = [
  ['desktop', Monitor],
  ['tablet', Tablet],
  ['mobile', Smartphone],
];

interface CustomizeEditorProps {
  index: CustomizeIndexData;
  widgetData: CustomizeWidgetData;
  onNotice: (notice: Notice) => void;
}

const CustomizeEditor = ({ index, widgetData, onNotice }: CustomizeEditorProps) => {
  const { t, i18n } = useTranslation();
  const { websiteId } = useParams<{ websiteId: string }>();
  const [updateCustomize, { isLoading: isSaving }] = useUpdateCustomizeMutation();

  const [values, setValues] = useState({
    setting: index.settings.setting ?? {},
    theme_setting: index.settings.theme_setting ?? {},
  });
  const [homeBlocks, setHomeBlocks] = useState<Record<string, PageBlockItem[]>>(
    index.homePageBlocks ?? {},
  );
  const [widgets, setWidgets] = useState<Record<string, SidebarWidgetItem[]>>(() => {
    const initial: Record<string, SidebarWidgetItem[]> = {};

    Object.entries(widgetData.sidebarWidgets ?? {}).forEach(([key, items]) => {
      initial[key] = items.map((item) => ({
        ...item,
        data: item.data ?? {},
        _tempKey: item.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      }));
    });

    return initial;
  });

  const [view, setView] = useState<View>('main');
  const [activePanelKey, setActivePanelKey] = useState<string | null>(null);
  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  const panels = useMemo(() => sortByPriority(index.panels), [index.panels]);

  const activePanel = activePanelKey
    ? ((panels.find(
        (item) => item.key === activePanelKey && isPanel(item),
      ) as CustomizePanelDefinition | undefined) ?? null)
    : null;

  const activeSection = useMemo<CustomizeSectionDefinition | null>(() => {
    if (!activeSectionKey) return null;

    const topLevel = panels.find((item) => item.key === activeSectionKey);
    if (topLevel) return topLevel as CustomizeSectionDefinition;

    for (const panel of panels) {
      if (!isPanel(panel) || !panel.childs || panel.key !== activePanelKey) continue;

      const found = toArray<CustomizeSectionDefinition>(panel.childs).find(
        (section) => section.key === activeSectionKey,
      );
      if (found) return found;
    }

    return null;
  }, [activeSectionKey, activePanelKey, panels]);

  const handleSettingChange = (key: string, value: unknown, isTheme = false): void => {
    const groupKey = isTheme ? 'theme_setting' : 'setting';
    setValues((prev) => ({ ...prev, [groupKey]: { ...prev[groupKey], [key]: value } }));
  };

  const handleSave = async (): Promise<void> => {
    try {
      await updateCustomize({
        locale: i18n.resolvedLanguage?.split('-')[0],
        setting: values.setting,
        theme_setting: values.theme_setting,
        blocks: homeBlocks,
        widgets,
      }).unwrap();

      onNotice({ type: 'success', message: t('admin.customize.notices.saved') });
      setIframeKey((prev) => prev + 1);
    } catch (error) {
      onNotice({
        type: 'error',
        message: getErrorMessage(error, t('admin.customize.errors.saveFailed')),
      });
    }
  };

  const renderSection = (section: CustomizeSectionDefinition) => (
    <div className="space-y-5">
      {toArray(section.controls).map((control) => (
        <CustomizeControlField
          key={control.key}
          control={control}
          index={index}
          settings={values}
          homeBlocks={homeBlocks}
          widgets={widgets}
          widgetData={widgetData}
          onChangeSetting={handleSettingChange}
          onChangeBlocks={setHomeBlocks}
          onChangeWidgets={setWidgets}
        />
      ))}
    </div>
  );

  const navigateBack = (): void => {
    if (view === 'section' && activeSection?.panel && activePanelKey) {
      setView('panel');
      setActiveSectionKey(null);
      return;
    }

    setView('main');
    setActiveSectionKey(null);
    setActivePanelKey(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-800 dark:bg-[#090D16] dark:text-slate-100">
      <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#0F1626] lg:w-[330px] lg:min-w-[300px]">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/[0.08]">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to={websitePath('/dashboard', websiteId)}
              title={t('admin.customize.exit')}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                {t('admin.customize.customizing')}
              </span>
              <h1 className="truncate text-sm font-bold">{index.title}</h1>
            </div>
          </div>

          <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
            {t('admin.customize.publish')}
          </Button>
        </header>

        {view !== 'main' && (
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100/70 px-4 py-2 text-xs dark:border-white/[0.08] dark:bg-slate-800/40">
            <button
              type="button"
              onClick={navigateBack}
              className="inline-flex items-center gap-1 font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {t('admin.customize.back')}
            </button>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="truncate font-bold text-slate-600 dark:text-slate-300">
              {view === 'section' ? activeSection?.title : activePanel?.title}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3">
          {view === 'main' && (
            <div className="space-y-2">
              {panels.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (isPanel(item)) {
                      setActivePanelKey(item.key);
                      setView('panel');
                    } else {
                      setActiveSectionKey(item.key);
                      setView('section');
                    }
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/70 p-3 text-left transition-colors hover:border-indigo-300 hover:bg-slate-50 dark:border-white/[0.08] dark:hover:bg-slate-800/40"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800">
                      <Layers className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400">
                        {isPanel(item)
                          ? t('admin.customize.panel')
                          : t('admin.customize.section')}
                      </span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}

          {view === 'panel' && activePanel && (
            <div className="space-y-2">
              {sortByPriority(toArray<CustomizeSectionDefinition>(activePanel.childs)).map(
                (section) => (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => {
                      setActiveSectionKey(section.key);
                      setView('section');
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/70 p-3 text-left transition-colors hover:border-indigo-300 hover:bg-slate-50 dark:border-white/[0.08] dark:hover:bg-slate-800/40"
                  >
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {section.title}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                ),
              )}
            </div>
          )}

          {view === 'section' && activeSection && renderSection(activeSection)}
        </div>

        <footer className="border-t border-slate-200 px-4 py-2 text-center text-[10px] text-slate-400 dark:border-white/[0.08]">
          {t('admin.customize.footer')}
        </footer>
      </aside>

      <section className="hidden h-full flex-1 flex-col lg:flex">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 dark:border-white/[0.08] dark:bg-[#0F1626]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('admin.customize.livePreview')}
          </span>

          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {DEVICES.map(([type, Icon]) => (
              <button
                key={type}
                type="button"
                onClick={() => setDevice(type)}
                className={`rounded-lg p-2 transition-all ${
                  device === type
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
          <div
            className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-300 dark:border-white/[0.08] ${
              device === 'mobile'
                ? 'h-[640px] w-[375px]'
                : device === 'tablet'
                  ? 'h-[820px] w-full max-w-[768px]'
                  : 'h-[640px] w-full'
            }`}
          >
            <iframe
              key={iframeKey}
              src={index.previewUrl ?? 'about:blank'}
              title={t('admin.customize.livePreview')}
              className="h-full w-full border-none"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export const CustomizeView = () => {
  const { t } = useTranslation();
  const [notice, setNotice] = useState<Notice | null>(null);

  const { data, isFetching, fulfilledTimeStamp } = useGetCustomizeQuery();
  const { data: widgetData, fulfilledTimeStamp: widgetsTimeStamp } =
    useGetCustomizeWidgetsQuery();

  const index = data?.data;

  useEffect(() => {
    if (notice?.type !== 'success') return;

    const handle = window.setTimeout(() => setNotice(null), 4000);

    return () => window.clearTimeout(handle);
  }, [notice]);

  if (!index || !widgetData) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 bg-slate-100 text-slate-400 dark:bg-[#090D16] dark:text-slate-500">
        <Loader2 className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
        <span className="text-sm">{t('admin.customize.loading')}</span>
      </div>
    );
  }

  return (
    <>
      <CustomizeEditor
        key={`${fulfilledTimeStamp}-${widgetsTimeStamp}`}
        index={index}
        widgetData={widgetData}
        onNotice={setNotice}
      />

      {notice && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center gap-2.5 rounded-xl border p-3 text-xs shadow-lg ${
            notice.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 backdrop-blur dark:text-emerald-400'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-600 backdrop-blur dark:text-rose-400'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}
    </>
  );
};

export default CustomizeView;
