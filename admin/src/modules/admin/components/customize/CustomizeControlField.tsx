import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MediaField } from '../MediaField';
import { HomePageCustomize } from './HomePageCustomize';
import { WidgetCustomize } from './WidgetCustomize';
import type {
  CustomizeControlDefinition,
  CustomizeIndexData,
  CustomizeWidgetData,
  PageBlockItem,
} from '../../../../types/customize';
import type { SidebarWidgetItem } from '../../../../types/widget';

interface CustomizeControlFieldProps {
  control: CustomizeControlDefinition;
  index: CustomizeIndexData;
  settings: {
    setting: Record<string, unknown>;
    theme_setting: Record<string, unknown>;
  };
  homeBlocks: Record<string, PageBlockItem[]>;
  widgets: Record<string, SidebarWidgetItem[]>;
  widgetData?: CustomizeWidgetData;
  onChangeSetting: (key: string, value: unknown, isTheme?: boolean) => void;
  onChangeBlocks: (blocks: Record<string, PageBlockItem[]>) => void;
  onChangeWidgets: (widgets: Record<string, SidebarWidgetItem[]>) => void;
}

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white';

/** Renders a single customizer control based on its `type`. */
export const CustomizeControlField: FC<CustomizeControlFieldProps> = ({
  control,
  index,
  settings,
  homeBlocks,
  widgets,
  widgetData,
  onChangeSetting,
  onChangeBlocks,
  onChangeWidgets,
}) => {
  const { t } = useTranslation();

  const isTheme = control.is_theme === true;
  const groupKey = isTheme ? 'theme_setting' : 'setting';
  const rawValue = settings[groupKey][control.settings];
  const value = rawValue === null || rawValue === undefined ? '' : String(rawValue);

  switch (control.type) {
    case 'site_identity': {
      const global = settings.setting;

      return (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('admin:customize.site.title')}
            </label>
            <input
              type="text"
              value={String(global.title ?? '')}
              onChange={(event) => onChangeSetting('title', event.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('admin:customize.site.description')}
            </label>
            <textarea
              rows={3}
              value={String(global.description ?? '')}
              onChange={(event) => onChangeSetting('description', event.target.value)}
              className={fieldClass}
            />
          </div>

          <MediaField
            label={t('admin:settings.fields.logo')}
            value={(global.logo as string | null) ?? null}
            onChange={(id) => onChangeSetting('logo', id)}
          />

          <MediaField
            label={t('admin:settings.fields.favicon')}
            value={(global.favicon as string | null) ?? null}
            onChange={(id) => onChangeSetting('favicon', id)}
          />
        </div>
      );
    }

    case 'textarea':
      return (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            {control.label}
          </label>
          <textarea
            rows={4}
            value={value}
            onChange={(event) => onChangeSetting(control.settings, event.target.value, isTheme)}
            className={fieldClass}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            {control.label}
          </label>
          <select
            value={value}
            onChange={(event) => onChangeSetting(control.settings, event.target.value, isTheme)}
            className={fieldClass}
          >
            {Object.entries(control.options ?? {}).map(([optionKey, optionLabel]) => (
              <option key={optionKey} value={optionKey}>
                {optionLabel}
              </option>
            ))}
          </select>
        </div>
      );

    case 'image':
      return (
        <MediaField
          label={control.label}
          value={value || null}
          onChange={(id) => onChangeSetting(control.settings, id, isTheme)}
        />
      );

    case 'homepage':
      return (
        <HomePageCustomize
          value={value}
          pages={index.pages}
          pageTemplates={index.pageTemplates}
          availableBlocks={index.availableBlocks}
          blocks={homeBlocks}
          onChangePage={(pageId) => onChangeSetting(control.settings, pageId, isTheme)}
          onBlocksChange={onChangeBlocks}
        />
      );

    case 'widgets':
      return widgetData ? (
        <WidgetCustomize data={widgetData} items={widgets} onChange={onChangeWidgets} />
      ) : null;

    default:
      return (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            {control.label}
          </label>
          <input
            type="text"
            value={value}
            onChange={(event) => onChangeSetting(control.settings, event.target.value, isTheme)}
            className={fieldClass}
          />
        </div>
      );
  }
};

export default CustomizeControlField;
