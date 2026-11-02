// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Set this to the deployed URL so canonical and social-sharing tags are absolute.
  // site: 'https://example.com',
  site: 'https://movember.colinbate.com',
  adapter: cloudflare({
    // Photos are optimized with sharp at build time; nothing runs at the edge.
    imageService: 'compile',
  }),

  // No sessions needed, so skip provisioning a KV namespace.
  session: false,

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Concert One',
      cssVariable: '--font-concert',
      weights: ['400'],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],

  server: {
    port: 4342,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
