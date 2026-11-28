<script setup lang="ts">
import type { TourAvailabilityResponse } from '~/composables/usePublicApi'

const props = defineProps<{
  modelValue: string
  minDate: string
  hasError?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const api = usePublicApi()

const initialMonth = (props.modelValue || props.minDate).slice(0, 7)
const viewMonth = ref(initialMonth)
const availability = ref<TourAvailabilityResponse | null>(null)
const loading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const monthLabel = computed(() => {
  const [y, m] = viewMonth.value.split('-').map(Number)
  const d = new Date(Date.UTC(y!, (m ?? 1) - 1, 15))
  const text = d.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
})

const canGoPrev = computed(() => viewMonth.value > props.minDate.slice(0, 7))

function shiftMonth(delta: number) {
  const [y, m] = viewMonth.value.split('-').map(Number)
  const d = new Date(Date.UTC(y!, (m ?? 1) - 1 + delta, 1))
  const next = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  if (delta < 0 && next < props.minDate.slice(0, 7)) return
  viewMonth.value = next
}

async function loadMonth(month: string, silent = false) {
  if (!silent) loading.value = true
  const res = await api.tourAvailability(month)
  if (!silent) loading.value = false
  if (res) {
    if (viewMonth.value === month) {
      availability.value = res
      if (props.modelValue && res.fullDates.includes(props.modelValue)) {
        emit('update:modelValue', '')
      }
    }
  } else if (!silent && viewMonth.value === month) {
    availability.value = null
  }
}

function refresh() {
  return loadMonth(viewMonth.value, true)
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    void refresh()
  }
}

onMounted(() => {
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      void refresh()
    }
  }, 15_000)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

defineExpose({ refresh })

watch(viewMonth, (m) => loadMonth(m), { immediate: true })

interface CalendarCell {
  key: string
  day: number
  dateKey: string
  disabled: boolean
  isSunday: boolean
  isFull: boolean
  isLow: boolean
  remaining: number | null
}

const cells = computed<(CalendarCell | null)[]>(() => {
  const [y, m] = viewMonth.value.split('-').map(Number)
  const year = y!
  const monthIdx = (m ?? 1) - 1
  const firstWeekday = new Date(Date.UTC(year, monthIdx, 1)).getUTCDay()
  const leadingBlanks = (firstWeekday + 6) % 7 // Lunes = 0
  const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate()

  const maxWeekday = availability.value?.maxPerDay.weekday ?? 6
  const maxSaturday = availability.value?.maxPerDay.saturday ?? 3
  const counts = availability.value?.counts ?? {}

  const list: (CalendarCell | null)[] = Array.from({ length: leadingBlanks }, () => null)

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${viewMonth.value}-${String(day).padStart(2, '0')}`
    const weekday = new Date(Date.UTC(year, monthIdx, day)).getUTCDay()
    const isSunday = weekday === 0
    const isPast = dateKey < props.minDate
    const maxForDay = isSunday ? 0 : weekday === 6 ? maxSaturday : maxWeekday
    const booked = counts[dateKey] ?? 0
    const remaining = availability.value ? Math.max(0, maxForDay - booked) : isSunday ? 0 : null
    const isFull = isSunday || (remaining !== null && remaining <= 0)
    const isLow = !isFull && remaining !== null && remaining <= 2

    list.push({
      key: dateKey,
      day,
      dateKey,
      disabled: isPast || isFull,
      isSunday,
      isFull,
      isLow,
      remaining,
    })
  }

  return list
})

const selectedCell = computed(() =>
  cells.value.find((c): c is CalendarCell => Boolean(c && c.dateKey === props.modelValue)) ?? null,
)

const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  const d = new Date(`${props.modelValue}T12:00:00`)
  const text = d.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
})

function selectDate(cell: CalendarCell) {
  if (cell.disabled) return
  emit('update:modelValue', cell.dateKey)
}
</script>

<template>
  <div
    class="rounded-2xl border bg-ink-900 p-4 transition"
    :class="hasError ? 'border-terra-500' : 'border-cream-50/15'"
  >
    <!-- Cabecera mes -->
    <div class="flex items-center justify-between pb-3">
      <button
        type="button"
        :disabled="!canGoPrev"
        aria-label="Mes anterior"
        class="grid h-8 w-8 place-items-center rounded-full border border-cream-50/15 text-cream-50/80 transition hover:border-bronze-400 hover:text-cream-50 disabled:cursor-not-allowed disabled:opacity-30"
        @click="shiftMonth(-1)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="flex items-center gap-2">
        <span class="font-display text-base font-semibold text-cream-50">{{ monthLabel }}</span>
        <span
          v-if="loading"
          class="h-1.5 w-1.5 animate-pulse rounded-full bg-bronze-400"
          title="Actualizando disponibilidad"
        />
      </div>

      <button
        type="button"
        aria-label="Mes siguiente"
        class="grid h-8 w-8 place-items-center rounded-full border border-cream-50/15 text-cream-50/80 transition hover:border-bronze-400 hover:text-cream-50"
        @click="shiftMonth(1)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Días de la semana -->
    <div class="grid grid-cols-7 gap-1 pb-2 text-center">
      <span
        v-for="w in WEEKDAYS"
        :key="w"
        class="text-[10px] font-semibold uppercase tracking-[0.16em] text-cream-50/40"
      >
        {{ w }}
      </span>
    </div>

    <!-- Celdas del mes -->
    <div class="grid grid-cols-7 gap-1">
      <template v-for="(cell, idx) in cells" :key="cell ? cell.key : `blank-${idx}`">
        <div v-if="!cell" class="h-10" />
        <button
          v-else
          type="button"
          :disabled="cell.disabled"
          :title="
            cell.isSunday
              ? 'Cerrado los domingos'
              : cell.isFull
                ? 'Sin lugares disponibles'
                : cell.remaining !== null
                  ? `${cell.remaining} lugares disponibles`
                  : 'Disponible'
          "
          class="relative flex h-10 flex-col items-center justify-center rounded-xl text-[13px] font-medium transition disabled:cursor-not-allowed"
          :class="[
            modelValue === cell.dateKey
              ? 'bg-bronze-500 font-semibold text-ink-900'
              : cell.disabled
                ? 'text-cream-50/20 line-through'
                : 'text-cream-50/90 hover:bg-cream-50/10',
          ]"
          @click="selectDate(cell)"
        >
          <span>{{ cell.day }}</span>
          <span
            v-if="modelValue !== cell.dateKey && !cell.disabled"
            class="mt-0.5 h-1 w-1 rounded-full"
            :class="cell.isLow ? 'bg-bronze-400' : 'bg-sage-500'"
          />
          <span
            v-else-if="cell.isFull && !cell.isSunday && cell.dateKey >= minDate"
            class="mt-0.5 h-1 w-1 rounded-full bg-terra-500/70"
          />
        </button>
      </template>
    </div>

    <!-- Resumen + Leyenda -->
    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-cream-50/10 pt-3 text-[11px]">
      <span v-if="selectedLabel" class="font-medium text-bronze-300">
        {{ selectedLabel }}
        <template v-if="selectedCell && selectedCell.remaining !== null">
          · {{ selectedCell.remaining }} {{ selectedCell.remaining === 1 ? 'lugar' : 'lugares' }}
        </template>
      </span>
      <span v-else class="text-cream-50/45">Selecciona un día disponible</span>

      <div class="flex items-center gap-3 text-[10px] text-cream-50/50">
        <span class="inline-flex items-center gap-1">
          <span class="h-1.5 w-1.5 rounded-full bg-sage-500" />
          Disponible
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-1.5 w-1.5 rounded-full bg-bronze-400" />
          Últimos lugares
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-1.5 w-1.5 rounded-full bg-terra-500/70" />
          Sin cupo
        </span>
      </div>
    </div>
  </div>
</template>
