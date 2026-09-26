import type { ComponentType, FC } from 'react';
import { Construction } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../ui/Card';

interface ComingSoonProps {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export const ComingSoon: FC<ComingSoonProps> = ({ Icon, title, description }) => {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in duration-200">
      <Card>
        <CardBody className="flex flex-col items-center justify-center text-center py-16">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Icon className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-amber-500">
              <Construction className="w-3.5 h-3.5" />
            </span>
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
          <span className="mt-4 inline-flex items-center rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 px-3 py-1 text-[11px] font-medium">
            {t('admin.comingSoon')}
          </span>
        </CardBody>
      </Card>
    </div>
  );
};
