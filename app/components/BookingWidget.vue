<script setup lang="ts">
import { parseDate, type DateValue } from '@internationalized/date'
import { categoryLabels } from '~/data/spaces'

const api = usePublicApi()
const { data: spacesData } = await useAsyncData('public-spaces', () => api.listSpaces())
const liveSpaces = computed(() => spacesData.value ?? [])

const emit = defineEmits<{ search: [payload: { date: string; category: string; guests: number }] }>()

const today = new Date().toISOString().slice(0, 10)
const date = ref(today)
const datePopoverOpen = ref(false)
const minCalendarDate = parseDate(today)
const calendarValue = computed({
  get: () => parseDate(date.value),
  set: (val: DateValue | undefined) => {
    if (val) {
      date.value = val.toString()
      datePopoverOpen.value = false
    }
  },
})
const formattedDate = computed(() => {
  const [y, m, d] = date.value.split('-')
  return `${d}/${m}/${y}`
})
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
    <div class="bg-white px-5 py-4">
      <span class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">Fecha</span>
      <UPopover v-model:open="datePopoverOpen">
        <button
          type="button"
          class="mt-1 flex h-8 w-full items-center justify-between text-left text-[15px] font-medium text-ink-900"
        >
          <span>{{ formattedDate }}</span>
          <UIcon name="i-lucide-calendar" class="h-4 w-4 text-ink-500" />
        </button>
        <template #content>
          <UCalendar v-model="calendarValue" :min-value="minCalendarDate" class="p-2" />
        </template>
      </UPopover>
    </div>
    <label class="bg-white px-5 py-4">
      <span class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">Tipo de espacio</span>
      <USelect
        v-model="category"
        :items="categories"
        variant="none"
        :ui="{ base: 'mt-1 h-8 w-full px-0 py-0 text-[15px] font-medium text-ink-900 shadow-none', trailingIcon: 'text-ink-500' }"
      />
    </label>
    <div class="bg-white px-5 py-4">
      <span class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">Personas</span>
      <UInputNumber
        v-model="guests"
        :min="1"
        :max="60"
        variant="none"
        size="sm"
        class="mt-1 w-full"
        :ui="{ base: 'h-8 bg-transparent px-0 py-0 text-[15px] font-semibold text-ink-900 shadow-none', increment: 'text-ink-700', decrement: 'text-ink-700' }"
      />
    </div>
    <button
      type="submit"
      class="flex items-center justify-center gap-2 bg-ink-900 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-bronze-600"
    >
      Buscar
      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
    </button>
  </form>
  <p class="mt-3 text-[11px] uppercase tracking-[0.18em] text-cream-100/50">
    {{ liveSpaces.length }} espacios disponibles · Metepec, Estado de México
  </p>
</template>
