// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils/module'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  vite: {
    resolve: {
      dedupe: ['vue']
    }
  },

  compatibilityDate: '2026-06-30',

  typescript: {
    tsConfig: {
      include: [
        // relative to the generated .nuxt/tsconfig.json
        '../test/integration/**/*'
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
