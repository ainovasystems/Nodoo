import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Dominio canónico. Cambiar aquí si la web se publica en otro dominio.
export const SITE_URL = 'https://nodobc.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      // La demo de gestión y los borradores legales no se indexan.
      filter: (page) => !page.includes('/app/') && !page.includes('/legal/'),
    }),
  ],
  build: { inlineStylesheets: 'auto' },
});
