<script setup lang="ts">
import { spaces, categoryLabels } from '~/data/spaces'

const emit = defineEmits<{ search: [payload: { date: string; category: string; guests: number }] }>()

const today = new Date().toISOString().slice(0, 10)
const date = ref(today)
const category = ref('todos')
const guests = ref(2)

const categories = [
  { value: 'todos', label: 'Todos los espacios' },
  ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
]

function submit() {
  emit('search', { date: date.value, category: category.value, guests: guests.value })
}
</script>

<template>
  <form
    class="widget-shell grid grid-cols-1 gap-px overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr_auto]"
    @submit.prevent="submit"
  >
    <label class="bg-white px-5 py-4">
      <span class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">Fecha</span>
      <input
        v-model="date"
        type="date"
        :min="today"
        class="mt-1 w-full bg-transparent text-[15px] font-medium text-ink-900"
      />
    </label>
    <label class="bg-white px-5 py-4">
      <span class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">Tipo de espacio</span>
      <select v-model="category" class="mt-1 w-full appearance-none bg-transparent text-[15px] font-medium text-ink-900">
        <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
    </label>
    <label class="bg-white px-5 py-4">
      <span class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">Personas</span>
      <div class="mt-1 flex items-center gap-3">
        <button type="button" class="grid h-7 w-7 place-items-center rounded-full border border-ink-900/15 text-ink-700" @click="guests = Math.max(1, guests - 1)">−</button>
        <span class="w-6 text-center text-[15px] font-semibold">{{ guests }}</span>
        <button type="button" class="grid h-7 w-7 place-items-center rounded-full border border-ink-900/15 text-ink-700" @click="guests = Math.min(60, guests + 1)">+</button>
      </div>
    </label>
    <button
      type="submit"
      class="flex items-center justify-center gap-2 bg-ink-900 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-bronze-600"
    >
      Buscar
      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
    </button>
  </form>
  <p class="mt-3 text-[11px] uppercase tracking-[0.18em] text-cream-100/50">
    {{ spaces.length }} espacios disponibles · Metepec, Estado de México
  </p>
</template>
