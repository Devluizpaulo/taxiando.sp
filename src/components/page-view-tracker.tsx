
'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/app/actions/analytics-actions';

export function PageViewTracker({ page }: { page: string }) {
  useEffect(() => {
    // This action is now called from the client side after the page loads,
    // which can be more stable for analytics tracking.
    trackPageView(page);
  }, [page]);

  return null;
}
