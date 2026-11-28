// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: ['@nuxt/ui'],
  ui: {
    colorMode: false,
    theme: {
      colors: ['primary', 'secondary', 'bronze', 'terra', 'sage', 'info', 'success', 'warning', 'error'],
    },
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      /// API pública del B2B (cowhub-b2b).
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ??
        (process.env.NODE_ENV === 'production'
          ? 'https://cowhub-b2b.vercel.app'
          : 'http://localhost:3000'),
    },
  },
  app: {
    head: {
      title: 'COW-HUB',
      htmlAttrs: { lang: 'es', class: 'dark' },
      meta: [
        { name: 'description', content: 'Business Center en Metepec: oficinas privadas, salas de juntas, auditorio y escritorios flexibles listos para operar.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Marcellus&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },
})
