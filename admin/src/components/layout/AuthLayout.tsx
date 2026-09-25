import type { FC } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Sun, Moon, Zap, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/useTheme';

export const AuthLayout: FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-500">
      {/* Background Decorative Gradients & Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/15 dark:bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 animate-subtle-float" />
          </div>
          <div>
            <div className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>{t('layout.brand')}</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {t('layout.brandTag')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('layout.brandDesc')}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] transition-all cursor-pointer"
            title={theme === 'dark' ? t('layout.themeToggle.switchToLight') : t('layout.themeToggle.switchToDark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero / Showcase Section (Visible on Large screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900/40 dark:from-indigo-950/60 dark:via-[#0c1222] dark:to-[#090D16] border border-indigo-500/20 shadow-2xl relative overflow-hidden backdrop-blur-xl min-h-[560px]">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('layout.hero.tag')}</span>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {t('layout.hero.title')}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('layout.hero.description')}
              </p>

              <div className="pt-4 space-y-3.5 border-t border-slate-200/50 dark:border-white/[0.08]">
                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>{t('layout.hero.features.templates')}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span>{t('layout.hero.features.deploy')}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>{t('layout.hero.features.security')}</span>
                </div>
              </div>
            </div>

            {/* Testimonial / Social proof footer */}
            <div className="relative z-10 mt-8 p-4 rounded-2xl bg-white/40 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.06] backdrop-blur-sm">
              <p className="text-xs italic text-slate-600 dark:text-slate-300">
                &ldquo;{t('layout.testimonial.quote')}&rdquo;
              </p>
              <div className="mt-2.5 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                  AT
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">{t('layout.testimonial.author')}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('layout.testimonial.role')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Forms Card */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md glass-dropdown rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-white/[0.08]">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-white/[0.06]">
        <div>{t('layout.footer.copyright')}</div>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-indigo-500 transition-colors">
            {t('layout.footer.privacy')}
          </a>
          <a href="#terms" className="hover:text-indigo-500 transition-colors">
            {t('layout.footer.terms')}
          </a>
          <a href="#support" className="hover:text-indigo-500 transition-colors">
            {t('layout.footer.support')}
          </a>
        </div>
      </footer>
    </div>
  );
};
