'use client';

import { useEffect, useState } from 'react';
import { useLocaleStore } from '@/lib/stores/localeStore';
import { useMessages } from '@/lib/i18n/useMessages';

interface FooterProps {
  lastUpdated?: string;
  lastUpdatedByLocale?: Record<string, string | undefined>;
  defaultLocale?: string;
  showVisitCount?: boolean;
}

// Loads the site-wide visit count from busuanzi (a free counter keyed on the
// page's Referer) via JSONP; each full page load counts as one visit.
function useBusuanziSiteViews(enabled: boolean): number | null {
  const [siteViews, setSiteViews] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const callbackName = `BusuanziCallback_${Date.now()}`;
    const globals = window as unknown as Record<string, unknown>;
    globals[callbackName] = (data: { site_pv?: number }) => {
      if (typeof data?.site_pv === 'number') setSiteViews(data.site_pv);
    };

    const script = document.createElement('script');
    script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callbackName}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      delete globals[callbackName];
    };
  }, [enabled]);

  return siteViews;
}

export default function Footer({ lastUpdated, lastUpdatedByLocale, defaultLocale = 'en', showVisitCount = false }: FooterProps) {
  const locale = useLocaleStore((state) => state.locale);
  const messages = useMessages();
  const siteViews = useBusuanziSiteViews(showVisitCount);

  const resolvedLastUpdated =
    lastUpdatedByLocale?.[locale] ||
    (defaultLocale ? lastUpdatedByLocale?.[defaultLocale] : undefined) ||
    lastUpdated ||
    new Date().toLocaleDateString(locale || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <footer className="border-t border-neutral-200/50 bg-neutral-50/50 dark:bg-neutral-900/50 dark:border-neutral-700/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-neutral-500">
            {messages.footer.lastUpdated}: {resolvedLastUpdated}
            {siteViews !== null && (
              <span>
                {' · '}
                {messages.footer.totalVisits.replace('{count}', siteViews.toLocaleString(locale || 'en-US'))}
              </span>
            )}
          </p>
          <p className="text-xs text-neutral-500 flex items-center">
            <a href="https://github.com/xyjoey/PRISM" target="_blank" rel="noopener noreferrer">
              {messages.footer.builtWithPrism}
            </a>
            <span className="ml-2">🚀</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
