import { useEffect } from 'react';

const BRAND = 'MHB Cake Design – Pâtissier';

export function useSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = title.includes('MHB') ? title : `${title} | ${BRAND}`;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
      const og = document.querySelector('meta[property="og:description"]');
      if (og) og.setAttribute('content', description);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', document.title);
  }, [title, description]);
}
