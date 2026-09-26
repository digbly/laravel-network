import { ShieldX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../ui/Card';

export const ForbiddenView = () => {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in duration-200">
      <Card>
        <CardBody className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <ShieldX className="w-6 h-6" />
          </div>
          <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
            {t('admin.forbidden.title')}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('admin.forbidden.message')}
          </p>
        </CardBody>
      </Card>
    </div>
  );
};
