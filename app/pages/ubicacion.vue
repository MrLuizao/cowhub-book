<script setup lang="ts">
useHead({ title: 'Ubicación · COW-HUB' })

const info = [
  {
    icon: 'pin',
    label: 'Dirección',
    value: 'Paseo San Isidro 111, Metepec, Edomex',
  },
  {
    icon: 'clock',
    label: 'Horario',
    value: 'Lun–Vie 7:00–21:00 · Sáb 9:00–15:00',
  },
  {
    icon: 'car',
    label: 'Estacionamiento',
    value: 'Acceso 24/7 para miembros',
  },
]

const nearby = [
  { name: 'Plaza del Parque', detail: 'A pasos — restaurantes, café y servicios' },
  { name: 'Centro histórico de Metepec', detail: '8 min en auto' },
  { name: 'Boulevard Toluca–Metepec', detail: 'Conexión directa a Toluca' },
  { name: 'Zona hotelera y restaurantes', detail: 'A 5 min — ideal para visitas de clientes' },
]
</script>

<template>
  <div>
    <PageHero eyebrow="Ubicación" image="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600&q=80"
      description="Plaza del Parque, Paseo San Isidro 111. A minutos del centro histórico, con acceso directo al boulevard Toluca–Metepec.">
      En el corazón de Metepec,<br /><em class="italic text-bronze-300">a pasos de todo.</em>
    </PageHero>

    <!-- Info editorial -->
    <section class="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
      <div class="mt-14 grid gap-14 lg:grid-cols-12">
        <div class="reveal lg:col-span-5">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-bronze-400">Encuéntranos</p>
          <h2 v-reveal-lines class="mt-4 font-display text-4xl font-semibold leading-[1.1] text-cream-50 lg:text-5xl">
            Un espacio pensado<br />para recibirte bien.
          </h2>
          <p class="mt-6 max-w-md text-sm leading-relaxed text-cream-50/60">
            Estamos dentro de Plaza del Parque, sobre Paseo San Isidro. Si vienes de Toluca,
            toma el boulevard directo; si vienes del centro de Metepec, son minutos.
          </p>
        </div>
        <div class="reveal lg:col-span-7">
          <ul class="divide-y divide-cream-50/10 border-y border-cream-50/10">
            <li v-for="item in info" :key="item.label" class="flex items-center gap-5 py-6">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cream-50/15">
                <svg v-if="item.icon === 'pin'" class="h-5 w-5 text-bronze-400" fill="none" stroke="currentColor"
                  stroke-width="1.6" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <svg v-else-if="item.icon === 'clock'" class="h-5 w-5 text-bronze-400" fill="none" stroke="currentColor"
                  stroke-width="1.6" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="h-5 w-5 text-bronze-400" fill="none" stroke="currentColor" stroke-width="1.6"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </span>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/40">{{ item.label }}</p>
                <p class="mt-1 text-sm font-medium text-cream-50">{{ item.value }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Contacto -->
    <!-- <div
      class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-14 sm:flex-row sm:items-center lg:px-8">
      <div class="reveal">
        <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-bronze-400">Contacto</p>
        <p class="mt-3 font-display text-2xl font-semibold text-cream-50">+52 (722) 222 0000</p>
        <p class="mt-1 text-sm text-cream-50/50">info@cowhub.mx</p>
      </div>
      <a href="https://maps.google.com/?q=Paseo+San+Isidro+111+Metepec" target="_blank" rel="noopener"
        class="inline-flex items-center gap-2 rounded-full bg-bronze-500 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-900 transition hover:bg-bronze-400">
        Cómo llegar
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div> -->

    <!-- Mapa full-bleed -->
    <section class="relative border-b border-cream-50/10 pb-20">
      <div class="mx-auto max-w-7xl px-5 lg:px-8">
        <div class="reveal relative overflow-hidden rounded-3xl border border-cream-50/10">
          <iframe title="Mapa — COW-HUB Metepec"
            src="https://www.google.com/maps?q=Paseo+San+Isidro+111,+Metepec,+Estado+de+M%C3%A9xico&output=embed"
            class="map-dark aspect-[16/9] w-full border-0 lg:aspect-[21/9]" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade" />
          <div class="absolute bottom-5 left-5 rounded-2xl bg-ink-900/90 px-5 py-4 backdrop-blur">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-bronze-400">Coworking · Business Center
            </p>
            <p class="mt-1 font-display text-lg font-semibold text-cream-50">Paseo San Isidro 111, Metepec</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Alrededores -->
    <section class="mx-auto w-full max-w-12xl py-24 lg:px-8" style="display: none;">
      <div class="rule">
        <p class="reveal text-[11px] font-semibold uppercase tracking-[0.3em] text-bronze-400">En los alrededores</p>
        <h2 v-reveal-lines class="mt-3 font-display text-3xl font-semibold text-cream-50 lg:text-4xl">
          Todo lo que tu día necesita,<br /><em class="italic text-bronze-300">a la vuelta.</em>
        </h2>
      </div>
      <div class="reveal-group mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="n in nearby" :key="n.name"
          class="rounded-2xl border border-cream-50/10 bg-ink-800/40 p-6 transition hover:border-bronze-500/40">
          <h3 class="font-display text-lg font-semibold text-cream-50">{{ n.name }}</h3>
          <p class="mt-2 text-sm text-cream-50/50">{{ n.detail }}</p>
        </article>
      </div>
    </section>

  </div>
</template>
