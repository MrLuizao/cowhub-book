# COW-HUB Book — Sitio público de reservas (Nuxt 4 + Tailwind v4)

Sitio customer-facing del Business Center Metepec: reservas de espacios
(`/espacios`), membresías, amenidades, testimonios, ubicación y lead de
tour (`/tour`). Repos hermanos: `cowhub-b2b` (consola + API), `cowhub-app`
(app Flutter), `cowhub-landing` (pitch).

## Reglas de UI (inquebrantables)

1. **Cursor pointer en TODO elemento interactivo**: cualquier `<a href>`,
   `<button>`, `<select>`, `<summary>`, elemento con `role="button"`/
   `"link"`/`"tab"`, checkbox/radio, label de input y tarjeta clickeable
   debe mostrar `cursor: pointer`. Está cubierto globalmente en
   `app/assets/css/main.css` — **no agregar `cursor-pointer` manual en
   clases** salvo casos excepcionales; los elementos deshabilitados usan
   `cursor: not-allowed`.
2. **PROHIBIDO sombras en botones/enlaces con estilo de botón**: nunca
   `shadow-*` en CTAs — deben verse limpios, sin sombreado exterior
   (misma regla que `rirhub-landing/AGENTS.md`).
3. **Tema dark luxury**: fondo `bg-ink-900`, textos `text-cream-50`,
   acentos `bronze-*`/`terra-*`. Cuidado al reusar estilos de tema claro:
   nada de `bg-ink-900` sobre fondo `ink-900` ni `text-ink-*` sobre
   tarjetas oscuras.
4. **Lenguaje comercial**: copy para dueños de negocio y clientes,
   sin tecnicismos.

## Contacto oficial del BC (no cambiar sin indicación)

- Dirección: **Paseo San Isidro 111, Metepec**
- Teléfono: **+52 (722) 222 0000**
- Email: `info@cowhub.mx`
- Horario footer: Lun–Vie 7:00–21:00 · Sáb 9:00–15:00

## Rutas

- `/` — abre con `ScrollJourney` (video scrubbed por scroll, 6 paradas;
  la última incluye `BookingWidget`), luego Stats → Membresías CTA →
  Amenidades → Testimonios → CTA final.
- `/espacios`, `/espacios/[id]` — catálogo y detalle con reserva mock.
- `/amenidades`, `/membresias`, `/testimonios`, `/ubicacion` — páginas
  independientes con `PageHero` (mismo hero de `/tour`).
- `/tour` — formulario de lead funcional (folio `TOUR-XXXXXX`). **Existe
  pero NO está en el menú** — solo accesible por URL directa y CTAs
  ("Agendar tour" en header, footer y CTAs de página).

## Sistema de componentes y animación

- `PageHero.vue` — hero estándar de páginas internas: imagen bg
  `opacity-25` + gradiente ink, eyebrow bronce, slot para titular con
  `v-reveal-lines`, descripción con `reveal`, `pt-36 lg:pt-44` por el
  header fijo.
- `ScrollJourney.vue` — sección sticky full-viewport: videos
  `paseo-1..6.mp4` en `public/video/` scrubbed por scroll
  (`video.currentTime`), posters en `public/img/`, riel lateral con
  progreso, paradas de texto, fallback a posters con
  `prefers-reduced-motion`/`saveData`. Los clips actuales son footage de
  restaurante (demo) — reemplazar por video real del BC cuando exista.
- `FacilitiesExplorer.vue` — lista vertical de amenidades con tarjetas
  bordeadas (`rounded-2xl border-cream-50/10 bg-ink-800/40`, activa en
  bronce) + panel de detalle.
- Animaciones globales (`app/plugins/reveal.ts` + `app/assets/css/main.css`):
  - `v-reveal-lines` — desenmascara titulares línea por línea (usar en
    `<h1>`/`<h2>` con `<br>` para separar líneas).
  - `.reveal` — fade + translateY(36px) + blur(10px) al entrar en viewport.
  - `.reveal-group` — stagger 60ms por hijo directo.
- `SpaceCard.vue` usa tarjeta clara (`bg-white`) intencionalmente como
  contraste sobre el fondo dark.
- Tipografía: `font-display` = Playfair Display, body = Inter.

## Integración con el B2B (datos reales)

- `runtimeConfig.public.apiBase` (env `NUXT_PUBLIC_API_BASE`, default
  `http://localhost:3000`) apunta a la API pública de cowhub-b2b.
- `app/composables/usePublicApi.ts` — cliente con **fallback a datos
  locales**: si la API no responde o devuelve un array vacío, el sitio sigue
  usando los datos locales protegidos.
- **Fuente de verdad inicial (Book ➔ B2B)**: Los datos de este proyecto
  (espacios, fotos, precios, amenidades, membresías) son la fuente de verdad
  inicial. Se sincronizan hacia Firestore en el B2B mediante su script
  `scripts/sync-from-book.mjs`.
- Endpoints consumidos: `GET /api/public/spaces`,
  `GET /api/public/spaces/:id?date=`, `POST /api/public/bookings`,
  `POST /api/public/tours`.
- **Puertos**: el B2B usa :3000 — correr esta web con
  `PORT=3100 npm run dev` cuando ambos estén activos.

## Comandos

```bash
npm run dev            # http://localhost:3000 (o PORT=3100)
PORT=3100 npm run dev  # junto al B2B en :3000
```

Validación: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/<ruta>`
debe dar 200 en todas las rutas.
