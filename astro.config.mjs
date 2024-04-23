import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: 'https://bryce-stabenow.dev',
  integrations: [tailwind(), sitemap(), icon(), expressiveCode()],
  devToolbar: {
    enabled: false
  }
});