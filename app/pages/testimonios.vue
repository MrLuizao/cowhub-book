<script setup lang="ts">
useHead({ title: 'Testimonios · COW-HUB' })

const testimonials = [
  {
    quote: 'Reservé la sala Andamio para un pitch y cerramos con un cliente en la misma junta. El espacio se siente premium y el café de barra es otro nivel.',
    name: 'Valeria M.',
    role: 'Fundadora · Estudio Norte',
  },
  {
    quote: 'Nuestro equipo de 6 trabaja aquí desde hace 8 meses. La comunidad del coworking nos trajo dos clientes directos del after office de marzo.',
    name: 'Diego S.',
    role: 'CEO · Agencia Ruta',
  },
  {
    quote: 'El auditorio para nuestro launch fue impecable: iluminación, sonido y staff. Los asistentes pensaron que era un hotel cinco estrellas.',
    name: 'Carla R.',
    role: 'Marketing · Nexa Labs',
  },
]
</script>

<template>
  <div>
    <PageHero eyebrow="Testimonios" image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80"
      description="Empresas, freelancers y equipos que ya encontraron su lugar en el corazón de Metepec.">
      Lo que dicen quienes<br />ya trabajan aquí.
    </PageHero>

    <div class="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div class="reveal-group mt-14 grid gap-6 md:grid-cols-3">
        <figure v-for="t in testimonials" :key="t.name"
          class="flex flex-col rounded-3xl border border-cream-50/10 bg-ink-800/60 p-8">
          <span class="font-display text-5xl leading-none text-bronze-500">"</span>
          <blockquote class="mt-4 flex-1 text-[15px] leading-relaxed text-cream-50/80">{{ t.quote }}</blockquote>
          <figcaption class="mt-6 border-t border-cream-50/10 pt-5">
            <p class="font-semibold text-cream-50">{{ t.name }}</p>
            <p class="mt-1 text-[12px] uppercase tracking-[0.14em] text-cream-50/50">{{ t.role }}</p>
          </figcaption>
        </figure>
      </div>

      <div class="reveal mt-16 text-center">
        <p class="font-display text-2xl font-semibold text-cream-50">¿Quieres ser el siguiente?</p>
        <div class="mt-6 flex flex-wrap justify-center gap-4">
          <NuxtLink to="/tour"
            class="rounded-full bg-bronze-500 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-900 transition hover:bg-bronze-400">
            Agendar tour
          </NuxtLink>
          <NuxtLink to="/espacios"
            class="rounded-full border border-cream-50/25 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:border-cream-50">
            Reservar un espacio
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>