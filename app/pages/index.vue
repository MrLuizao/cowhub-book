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
    <section class="border-t border-cream-50/10 bg-ink-900 py-20 lg:py-28">
      <div class="mx-auto max-w-5xl px-5 lg:px-8">
        <div
          class="reveal relative overflow-hidden rounded-3xl border border-cream-50/10 bg-ink-800/50 px-6 py-12 text-center sm:px-12 sm:py-16">
          <!-- <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-bronze-400">
            Siguiente paso
          </p> -->
          <h2 v-reveal-lines
            class="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight text-cream-50 sm:text-5xl">
            Conoce el espacio en persona<br />
            <em class="font-normal italic text-bronze-300">o reserva tu lugar hoy.</em>
          </h2>
          <p class="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream-50/65 sm:text-base">
            Agenda un recorrido privado por nuestras instalaciones en Metepec o elige tu sala o escritorio en línea.
          </p>
          <div class="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
            <NuxtLink to="/espacios"
              class="w-full rounded-full bg-bronze-500 px-8 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-bronze-400 sm:w-auto">
              Reservar ahora
            </NuxtLink>
            <NuxtLink to="/tour"
              class="w-full rounded-full border border-bronze-500/60 px-8 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-bronze-300 transition hover:bg-bronze-500 hover:text-ink-900 sm:w-auto">
              Agendar tour
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
