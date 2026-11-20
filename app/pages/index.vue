<script setup lang="ts">
useHead({ title: 'COW-HUB' })

const stats = [
  { value: 40, suffix: '+', label: 'Empresas en comunidad' },
  { value: 12, suffix: 'k', label: 'm² de espacios' },
  { value: 98, suffix: '%', label: 'Satisfacción de miembros' },
  { value: 4, suffix: '.9', label: 'Calificación Google' },
]
</script>

<template>
  <div class="bg-ink-900">
    <!-- ============ RECORRIDO VIRTUAL ============ -->
    <ScrollJourney />

    <!-- ============ STATS ============ -->
    <!-- <section class="border-y border-cream-50/10">
      <div class="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <StatsCounters :stats="stats" />
      </div>
    </section> -->

    <!-- ============ CTA FINAL ============ -->
    <section class="border-t border-cream-50/10 bg-ink-800/40 py-24">
      <!-- <div class="mx-auto max-w-7xl px-5 text-center lg:px-8"> -->
      <!-- <p class="reveal text-[11px] font-semibold uppercase tracking-[0.3em] text-bronze-400">Siguiente paso</p>
        <h2 v-reveal-lines
          class="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-cream-50 sm:text-5xl">
          Tu equipo merece un espacio<br />que trabaje contigo.
        </h2> -->
      <div class="reveal-group flex flex-wrap justify-center gap-4">
        <NuxtLink to="/membresias"
          class="rounded-full bg-bronze-500 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-900 transition hover:bg-bronze-400">
          Ver membresías</NuxtLink>
        <NuxtLink to="/espacios"
          class="rounded-full border border-cream-50/25 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:border-cream-50">
          Reservar un espacio</NuxtLink>
        <NuxtLink to="/amenidades"
          class="rounded-full border border-cream-50/25 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:border-cream-50">
          Conocer amenidades</NuxtLink>
      </div>
      <!-- </div> -->
    </section>
  </div>
</template>
