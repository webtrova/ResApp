'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useSmoothNavigation() {
  const router = useRouter();

  const navigate = useCallback((href: string, options?: { 
    replace?: boolean;
    scroll?: boolean;
  }) => {
    if (options?.replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  }, [router]);

  return { navigate, router };
}
