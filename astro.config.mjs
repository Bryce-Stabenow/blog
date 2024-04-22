import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import markdoc from "@astrojs/markdoc";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: 'https://bryce-stabenow.dev',
  integrations: [tailwind(), sitemap(), markdoc(), icon()],
  devToolbar: {
    enabled: false
  }
});