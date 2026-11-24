<script setup lang="ts">
useHead({ title: 'Membresías · COW-HUB' })

const mxn = (n: number) => '$' + n.toLocaleString('es-MX')

const memberships = [
  {
    name: 'Hot Desk',
    price: 3200,
    tagline: 'Para consultores y trabajo móvil',
    features: ['Escritorio flexible por día', 'Café ilimitado', 'WiFi premium', 'Comunidad y eventos'],
    highlight: false,
  },
  {
    name: 'Coworking',
    price: 6500,
    tagline: 'Ideal para profesionales independientes',
    features: ['Escritorio dedicado', '2h de sala de juntas/mes', 'Lockers y almacenamiento', 'Invitados 2x mes', 'Perks de la plaza'],
    highlight: true,
  },
  {
    name: 'Oficina',
    price: 18000,
    tagline: 'Privacidad para equipos de 3 a 8 personas',
    features: ['Oficina privada equipada', '8h de sala/mes', 'Dirección fiscal', 'Recepción personalizada', 'Acceso 24/7'],
    highlight: false,
  },
]
</script>

<template>
  <div>
    <PageHero eyebrow="Membresías" image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80"
      description="Planes mensuales con café de barra, internet dedicado y acceso a comunidad. Sin plazos forzosos: empieza hoy y escala cuando tu equipo crezca.">
      Desde un escritorio flexible<br />hasta tu oficina privada.
    </PageHero>

    <div class="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div class="reveal-group mt-14 grid gap-6 lg:grid-cols-3">
      <div v-for="m in memberships" :key="m.name"
        class="relative flex flex-col rounded-3xl p-8 transition"
        :class="m.highlight ? 'bg-bronze-500 text-ink-900' : 'bg-ink-800/60 text-cream-50 ring-1 ring-cream-50/10'">
        <span v-if="m.highlight"
          class="absolute -top-3 left-8 rounded-full bg-ink-900 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-bronze-300">Más
          elegido</span>
        <p class="text-[11px] font-semibold uppercase tracking-[0.22em]"
          :class="m.highlight ? 'text-ink-800' : 'text-bronze-300'">{{ m.tagline }}</p>
        <h2 class="mt-3 font-display text-3xl font-semibold">{{ m.name }}</h2>
        <p class="mt-4">
          <span class="font-display text-5xl font-semibold">{{ mxn(m.price) }}</span>
          <span class="text-sm" :class="m.highlight ? 'text-ink-800/70' : 'text-cream-50/50'">/mes</span>
        </p>
        <ul class="mt-7 flex-1 space-y-3 text-sm">
          <li v-for="f in m.features" :key="f" class="flex items-start gap-3">
            <svg class="mt-0.5 h-4 w-4 shrink-0" :class="m.highlight ? 'text-ink-900' : 'text-bronze-400'" fill="none"
              stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span :class="m.highlight ? 'text-ink-900/85' : 'text-cream-50/75'">{{ f }}</span>
          </li>
        </ul>
        <NuxtLink to="/tour"
          class="mt-8 rounded-full py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] transition"
          :class="m.highlight ? 'bg-ink-900 text-cream-50 hover:bg-ink-800' : 'bg-cream-50 text-ink-900 hover:bg-bronze-300'">
          Agendar tour
        </NuxtLink>
      </div>
    </div>

    <div class="reveal mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-cream-50/10 bg-ink-800/60 px-8 py-10">
      <div>
        <h2 class="font-display text-2xl font-semibold text-cream-50">¿No sabes qué plan te conviene?</h2>
        <p class="mt-2 text-sm text-cream-50/60">Agenda un tour y te ayudamos a armar la combinación ideal para tu equipo.</p>
      </div>
      <NuxtLink to="/tour"
        class="rounded-full bg-bronze-500 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-900 transition hover:bg-bronze-400">
        Agendar tour
      </NuxtLink>
    </div>
    </div>
  </div>
</template>
