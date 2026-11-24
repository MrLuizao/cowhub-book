<script setup lang="ts">
import type { CoworkSpace } from '~/data/spaces'
import { categoryLabels } from '~/data/spaces'

defineProps<{ space: CoworkSpace }>()
const mxn = (n: number) => '$' + n.toLocaleString('es-MX')
</script>

<template>
  <NuxtLink
    :to="`/espacios/${space.id}`"
    class="group block overflow-hidden rounded-2xl border border-cream-50/10 bg-ink-800/70 transition duration-500 hover:-translate-y-1 hover:border-bronze-500/40"
  >
    <div class="relative aspect-[4/3] overflow-hidden">
      <img
        :src="space.image"
        :alt="space.name"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <span class="absolute left-4 top-4 rounded-full bg-ink-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-50 backdrop-blur">
        {{ categoryLabels[space.category] }}
      </span>
    </div>
    <div class="p-6">
      <p class="text-[11px] uppercase tracking-[0.2em] text-bronze-400">{{ space.tagline }}</p>
      <h3 class="mt-2 font-display text-2xl font-semibold text-cream-50">{{ space.name }}</h3>
      <div class="mt-4 flex items-end justify-between">
        <p class="text-sm text-cream-50/60">
          Hasta <span class="font-semibold text-cream-50">{{ space.capacity }}</span> personas
        </p>
        <p class="text-sm">
          <span class="font-display text-xl font-semibold text-bronze-300">{{ mxn(space.pricePerHour) }}</span>
          <span class="text-cream-50/50">/hora</span>
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
