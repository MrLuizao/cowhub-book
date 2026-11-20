<script setup lang="ts">
import { spaces } from '~/data/spaces'

const tabs = [
  { id: 'todos', label: 'Todos' },
  { id: 'sala-juntas', label: 'Salas de juntas' },
  { id: 'evento', label: 'Eventos' },
  { id: 'escritorio', label: 'Escritorio' },
  { id: 'focus', label: 'Focus' },
]
const active = ref('todos')
const filtered = computed(() =>
  active.value === 'todos' ? spaces : spaces.filter((s) => s.category === active.value),
)
const mxn = (n: number) => '$' + n.toLocaleString('es-MX')
</script>

<template>
  <div>
    <!-- Tabs estilo "Explore Our Rooms" -->
    <div class="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="shrink-0 rounded-full border px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] transition-all duration-300"
        :class="active === t.id
          ? 'border-bronze-500 bg-bronze-500 text-ink-900'
          : 'border-cream-50/15 text-cream-50/70 hover:border-cream-50/40 hover:text-cream-50'"
        @click="active = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Cards -->
    <TransitionGroup name="cards" tag="div" class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="s in filtered"
        :key="s.id"
        class="group relative overflow-hidden rounded-3xl bg-ink-800/60 ring-1 ring-cream-50/10 transition duration-500 hover:-translate-y-1 hover:ring-bronze-500/40"
      >
        <NuxtLink :to="`/espacios/${s.id}`" class="block">
          <div class="relative aspect-[16/10] overflow-hidden">
            <img :src="s.image" :alt="s.name" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
            <span class="absolute left-4 top-4 rounded-full bg-ink-900/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-bronze-300 backdrop-blur">
              {{ s.tagline }}
            </span>
            <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <h3 class="font-display text-2xl font-semibold text-cream-50">{{ s.name }}</h3>
              <p class="text-right text-sm text-cream-50/80">
                <span class="font-display text-xl font-semibold text-bronze-300">{{ mxn(s.pricePerHour) }}</span>
                <span class="text-cream-50/50">/h</span>
              </p>
            </div>
          </div>
          <div class="p-6">
            <p class="line-clamp-2 text-sm leading-relaxed text-cream-50/60">{{ s.description }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="a in s.amenities.slice(0, 3)"
                :key="a"
                class="rounded-full bg-cream-50/5 px-3 py-1 text-[11px] text-cream-50/60"
              >{{ a }}</span>
              <span v-if="s.amenities.length > 3" class="rounded-full bg-cream-50/5 px-3 py-1 text-[11px] text-cream-50/40">
                +{{ s.amenities.length - 3 }}
              </span>
            </div>
            <p class="mt-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-bronze-300">
              Reservar
              <svg class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </p>
          </div>
        </NuxtLink>
      </article>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.cards-enter-active,
.cards-leave-active {
  transition: all 0.4s ease;
}
.cards-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.cards-leave-to {
  opacity: 0;
}
.cards-move {
  transition: transform 0.4s ease;
}
</style>
