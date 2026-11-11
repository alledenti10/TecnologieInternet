export default defineNuxtConfig({
  app: {
    head: {
      title: 'Preventivi AI',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icona-sito.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/icona-sito.svg' }
      ],
      meta: [
        { name: 'theme-color', content: '#0f172a' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ]
    }
  },

  // 🛠 Abilita DevTools per debugging durante lo sviluppo
  devtools: { enabled: true },

  // 🎨 Importa il file principale di Tailwind (compilato da @nuxtjs/tailwindcss)
  css: ['~/assets/css/stile-principale.css'],

  // 📦 Moduli installati: Supabase + Tailwind
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],

  // ⚙️ Configurazione interna del modulo Tailwind
  tailwindcss: {
    injectPosition: 'last',        // Assicura che Tailwind venga caricato dopo gli altri CSS
    viewer: false,                 // Disattiva l’inspector grafico
    cssPath: '~/assets/css/stile-principale.css' // Percorso del file CSS
  },

  // ⚡ Patch per Vite: migliora compatibilità con dompurify (PDF sanitization)
  vite: {
    optimizeDeps: {
      include: ['dompurify']
    }
  },

  // 🔌 Config Supabase lato client (solo env NUXT_PUBLIC_*)
  supabase: {
    types: '~/types/tipi-database.ts',
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/accesso',
      callback: '/conferma-email',
      exclude: [
        '/registrazione', '/recupera-password', '/reimposta-password',
        // Alias conservati per i link già inviati e gli URL autorizzati in Supabase.
        '/login', '/register', '/confirm', '/forgot-password', '/reset-password'
      ]
    }
  },

  // 🔐 Runtime Config sicuro: variabili server + client
  runtimeConfig: {
    // Variabili private disponibili solo server-side
    aiApiKey: process.env.AI_API_KEY || '',        // API key privata
    aiBaseUrl: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
    aiModel: process.env.AI_MODEL || 'openrouter/free',
    aiMaxOutputTokens: process.env.AI_MAX_OUTPUT_TOKENS || '2000',
    databaseUrl: process.env.DATABASE_URL,          // Connessione a PostgreSQL
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // Admin Server Key

    public: {
      // Variabili esposte al client (prefisso NUXT_PUBLIC_*)
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    }
  },

  // 🚀 Configurazione Nitro (server Nuxt)
  nitro: {
    preset: 'vercel',
    // Traccia i pacchetti che combinano ESM e require (nft issue #543).
    externals: {
      traceOptions: { mixedModules: true }
    },
    compatibilityDate: '2025-11-19' // Data per API stability (simile a Cloudflare Workers)
  }
})
