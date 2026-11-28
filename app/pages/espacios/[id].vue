<script setup lang="ts">
import { parseDate, type DateValue } from '@internationalized/date'
import { categoryLabels } from '~/data/spaces'

const route = useRoute()
const api = usePublicApi()

const { data: allSpaces } = await useAsyncData('public-spaces', () => api.listSpaces())
const space = computed(() => allSpaces.value?.find((s) => s.id === route.params.id))

if (!space.value) {
  throw createError({ statusCode: 404, statusMessage: 'Espacio no encontrado' })
}

useHead({ title: () => `${space.value!.name} · COW-HUB` })

const mxn = (n: number) => '$' + n.toLocaleString('es-MX')

// --- Reserva ---
const today = new Date().toISOString().slice(0, 10)
const date = ref(today)
const datePopoverOpen = ref(false)
const minCalendarDate = parseDate(today)
const calendarPlaceholder = ref<DateValue>(parseDate(today))
const monthAvailability = ref<Record<string, { full: boolean; bookedHours: number }>>({})
const monthCache = new Map<string, Record<string, { full: boolean; bookedHours: number }>>()

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

async function loadMonthAvailability(monthKey: string) {
  const cached = monthCache.get(monthKey)
  if (cached) {
    monthAvailability.value = cached
    return
  }
  const res = await api.spaceMonthAvailability(String(route.params.id), monthKey)
  if (res) {
    monthCache.set(monthKey, res.days)
    monthAvailability.value = res.days
  }
}

watch(
  calendarPlaceholder,
  (val) => {
    const monthKey = `${val.year}-${String(val.month).padStart(2, '0')}`
    loadMonthAvailability(monthKey)
  },
  { immediate: true },
)

function dayStatus(d: DateValue): 'full' | 'partial' | 'free' {
  const info = monthAvailability.value[d.toString()]
  if (!info) return 'free'
  if (info.full) return 'full'
  if (info.bookedHours > 0) return 'partial'
  return 'free'
}

function isDateDisabled(d: DateValue): boolean {
  return dayStatus(d) === 'full'
}
const startHour = ref(9)
const duration = ref(2) // horas
const guests = ref(2)
const billing = ref<'hora' | 'dia'>('hora')
const name = ref('')
const email = ref('')
const company = ref('')
const confirmed = ref(false)
const bookingRef = ref('')
const bookingPending = ref(false)
const bookingError = ref('')

interface BookedSlot {
  mode: string
  startHour: number | null
  endHour: number | null
}
const bookedSlots = ref<BookedSlot[] | null>(null)
const apiLive = ref(false)

async function loadAvailability(d: string) {
  const res = await api.spaceDetail(String(route.params.id), d)
  if (res) {
    bookedSlots.value = res.booked
    apiLive.value = true
    if (occupied(startHour.value)) {
      const firstFree = hours.find((h) => !occupied(h))
      if (firstFree != null) startHour.value = firstFree
    }
  } else {
    bookedSlots.value = null
    apiLive.value = false
  }
}
watch(date, loadAvailability, { immediate: true })

// Slots ocupados en tiempo real desde el servidor.
function occupied(h: number) {
  if (!bookedSlots.value) return false
  return bookedSlots.value.some((b) =>
    b.mode === 'day'
      ? true
      : b.startHour != null && b.endHour != null && h >= b.startHour && h < b.endHour,
  )
}
const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7:00–20:00

const selectionConflict = computed(() => {
  if (!bookedSlots.value || bookedSlots.value.length === 0) return ''
  if (billing.value === 'dia') {
    return 'Este día ya tiene reservas; elige modalidad por hora o selecciona otra fecha.'
  }
  const end = startHour.value + duration.value
  if (end > 20) {
    return 'El horario seleccionado excede la hora de cierre (20:00).'
  }
  for (let h = startHour.value; h < end; h++) {
    if (occupied(h)) {
      return `El rango ${startHour.value}:00–${end}:00 incluye horas ya ocupadas.`
    }
  }
  return ''
})
const durationOptions = [
  { label: '1 hora', value: 1 },
  { label: '2 horas', value: 2 },
  { label: '3 horas', value: 3 },
  { label: '4 horas', value: 4 },
  { label: '6 horas', value: 6 },
]
const endHour = computed(() => startHour.value + duration.value)
const total = computed(() => {
  const s = space.value!
  return billing.value === 'dia' ? (s.pricePerDay ?? s.pricePerHour * 8) : s.pricePerHour * duration.value
})

const galleryIndex = ref(0)

async function confirm() {
  if (!name.value.trim() || !email.value.includes('@') || bookingPending.value) return
  bookingError.value = ''
  bookingPending.value = true
  try {
    const res = await api.createBooking({
      space_id: space.value!.id,
      date: date.value,
      mode: billing.value === 'dia' ? 'day' : 'hour',
      start_hour: billing.value === 'dia' ? undefined : startHour.value,
      duration_hours: billing.value === 'dia' ? undefined : duration.value,
      people: guests.value,
      name: name.value,
      email: email.value,
      company: company.value || undefined,
    })
    if (res && 'booking' in res) {
      bookingRef.value = res.booking.folio
      confirmed.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      bookingError.value = res && 'error' in res ? res.error : 'Error al conectar con el servidor de reservas'
    }
  } catch (err: unknown) {
    bookingError.value = 'Ocurrió un error al procesar tu reserva'
  } finally {
    bookingPending.value = false
  }
}
</script>

<template>
  <div v-if="space" class="pb-24">
    <!-- Hero image -->
    <div class="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
      <img :src="space.gallery[galleryIndex] ?? space.image" :alt="space.name" class="h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
      <div class="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <NuxtLink to="/espacios"
          class="text-[11px] font-semibold uppercase tracking-[0.25em] text-cream-100/70 hover:text-cream-50">
          ← Todos los espacios
        </NuxtLink>
        <p class="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-bronze-300">
          {{ categoryLabels[space.category] }}
        </p>
        <h1 class="mt-2 font-display text-4xl font-semibold text-cream-50 sm:text-6xl">{{ space.name }}</h1>
        <p class="mt-3 max-w-xl font-display text-lg italic text-cream-100/80">{{ space.tagline }}</p>
      </div>
    </div>

    <!-- Confirmación -->
    <div v-if="confirmed" class="mx-auto max-w-3xl px-5 pt-16 lg:px-8">
      <div class="rounded-3xl border border-sage-500/30 bg-sage-500/10 p-10 text-center">
        <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-sage-500">Reserva confirmada</p>
        <h2 class="mt-3 font-display text-4xl font-semibold text-cream-50">{{ space.name }}</h2>
        <p class="mt-2 text-cream-50/60">
          {{ new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long'
          }) }}
          · {{ billing === 'dia' ? 'Día completo' : `${startHour}:00 – ${endHour}:00` }}
        </p>
        <p class="mt-6 inline-block rounded-full bg-ink-900 px-6 py-3 font-mono text-sm tracking-[0.2em] text-cream-50">
          {{ bookingRef }}
        </p>
        <p class="mt-4 text-sm text-cream-50/60">
          Te enviamos los detalles a <b>{{ email }}</b>. Presenta tu folio en recepción.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <NuxtLink to="/espacios"
            class="rounded-full bg-ink-900 px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream-50">
            Reservar otro espacio</NuxtLink>
          <NuxtLink to="/"
            class="rounded-full border border-cream-50/20 px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream-50">
            Volver al inicio</NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="mx-auto grid max-w-7xl gap-12 px-5 pt-12 lg:grid-cols-[1fr_420px] lg:px-8">
      <!-- Columna izquierda -->
      <div>
        <!-- Galería -->
        <div class="grid gap-3 sm:grid-cols-3">
          <button v-for="(img, i) in space.gallery" :key="img"
            class="group relative aspect-[4/3] overflow-hidden rounded-xl"
            :class="i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''" @click="galleryIndex = i">
            <img :src="img" :alt="space.name"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
            <span v-if="galleryIndex === i" class="absolute inset-0 ring-2 ring-inset ring-bronze-400" />
          </button>
        </div>

        <p class="mt-8 text-[15px] leading-relaxed text-cream-50">{{ space.description }}</p>

        <div class="mt-8 flex flex-wrap gap-3">
          <span v-for="a in space.amenities" :key="a"
            class="rounded-full border border-cream-50/12 bg-ink-900 px-4 py-2 text-[12px] font-medium text-cream-50">
            {{ a }}
          </span>
        </div>

        <div class="rule mt-10 pt-8">
          <h2 class="font-display text-2xl font-semibold text-cream-50">Qué incluye</h2>
          <ul class="mt-5 grid gap-3 text-sm text-cream-50/70 sm:grid-cols-2">
            <li class="flex items-start gap-3"><span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-bronze-500" /> WiFi
              premium y café de barra</li>
            <li class="flex items-start gap-3"><span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-bronze-500" /> Recepción
              y registro de acceso</li>
            <li class="flex items-start gap-3"><span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-bronze-500" /> Limpieza y
              amenities entre usos</li>
            <li class="flex items-start gap-3"><span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-bronze-500" /> Soporte en
              sitio durante tu reserva</li>
          </ul>
        </div>
      </div>

      <!-- Columna reserva -->
      <aside class="lg:sticky lg:top-28 lg:self-start">
        <div class="widget-shell overflow-hidden rounded-3xl">
          <div class="border-b border-cream-50/10 bg-ink-700/60 px-7 py-5">
            <div class="flex items-end justify-between">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Desde</p>
                <p class="font-display text-3xl font-semibold text-cream-50">{{ mxn(space.pricePerHour) }}<span
                    class="text-sm font-normal text-cream-50/50">/hora</span></p>
              </div>
              <p v-if="space.pricePerDay" class="text-right text-[11px] text-cream-50/60">
                Día completo<br /><b class="text-cream-50">{{ mxn(space.pricePerDay) }}</b>
              </p>
            </div>
          </div>

          <div class="space-y-5 p-7">
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Fecha</label>
              <UPopover v-model:open="datePopoverOpen">
                <button
                  type="button"
                  class="mt-1.5 flex w-full items-center justify-between rounded-xl border border-cream-50/15 bg-ink-900 px-4 py-3 text-[15px] font-medium text-cream-50 transition hover:border-cream-50/30"
                >
                  <span>{{ formattedDate }}</span>
                  <UIcon name="i-lucide-calendar" class="h-4 w-4 text-cream-50/60" />
                </button>
                <template #content>
                  <div class="p-2">
                    <UCalendar
                      v-model="calendarValue"
                      v-model:placeholder="calendarPlaceholder"
                      :min-value="minCalendarDate"
                      :is-date-disabled="isDateDisabled"
                    >
                      <template #day="{ day }">
                        <div class="flex flex-col items-center leading-none">
                          <span>{{ day.day }}</span>
                          <span
                            v-if="day.toString() >= today"
                            class="mt-0.5 h-1 w-1 rounded-full"
                            :class="
                              dayStatus(day) === 'full'
                                ? 'bg-terra-500/80'
                                : dayStatus(day) === 'partial'
                                  ? 'bg-bronze-400'
                                  : 'bg-sage-500'
                            "
                          />
                        </div>
                      </template>
                    </UCalendar>
                    <div class="mt-2 flex items-center justify-center gap-3 border-t border-cream-50/10 pt-2 text-[10px] text-cream-50/60">
                      <span class="inline-flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-sage-500" /> Libre</span>
                      <span class="inline-flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-bronze-400" /> Con reservas</span>
                      <span class="inline-flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-terra-500/80" /> Sin cupo</span>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>

            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Horario
                disponible</label>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                <button v-for="h in hours" :key="h" :disabled="billing === 'dia' || occupied(h)"
                  class="h-9 w-11 rounded-lg text-[12px] font-semibold transition" :class="[
                    occupied(h) ? 'cursor-not-allowed bg-cream-50/5 text-cream-50/30 line-through' : '',
                    startHour === h && billing !== 'dia' ? 'bg-bronze-500 text-ink-900' : '',
                    !occupied(h) && startHour !== h ? 'bg-cream-50/10 text-cream-50 hover:bg-cream-50/20' : '',
                  ]" @click="startHour = h">
                  {{ h }}
                </button>
              </div>
              <p class="mt-1.5 text-[11px] text-cream-50/50">Horas en gris no disponibles · reservas mínimas de 1h</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Duración</label>
                <USelect
                  v-model="duration"
                  :items="durationOptions"
                  :disabled="billing === 'dia'"
                  size="xl"
                  class="mt-1.5 w-full"
                  :ui="{ base: 'h-12 rounded-xl border border-cream-50/15 bg-ink-900 px-3 text-[14px] font-medium text-cream-50 ring-0 shadow-none' }"
                />
              </div>
              <div>
                <label
                  class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Personas</label>
                <UInputNumber
                  v-model="guests"
                  :min="1"
                  :max="space.capacity"
                  size="xl"
                  class="mt-1.5 w-full"
                  :ui="{ base: 'h-12 rounded-xl border border-cream-50/15 bg-ink-900 text-[14px] font-semibold text-cream-50 ring-0 shadow-none' }"
                />
              </div>
            </div>

            <div class="flex rounded-xl border border-cream-50/15 p-1">
              <button class="flex-1 rounded-lg py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition"
                :class="billing === 'hora' ? 'bg-bronze-500 text-ink-900' : 'text-cream-50/60'"
                @click="billing = 'hora'">Por hora</button>
              <button v-if="space.pricePerDay"
                class="flex-1 rounded-lg py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition"
                :class="billing === 'dia' ? 'bg-bronze-500 text-ink-900' : 'text-cream-50/60'"
                @click="billing = 'dia'">Día completo</button>
            </div>

            <div class="space-y-3 border-t border-cream-50/10 pt-5">
              <input v-model="name" type="text" placeholder="Nombre completo"
                class="w-full rounded-xl border border-cream-50/15 bg-ink-900 px-4 py-3 text-[14px]" />
              <input v-model="email" type="email" placeholder="Correo electrónico"
                class="w-full rounded-xl border border-cream-50/15 bg-ink-900 px-4 py-3 text-[14px]" />
              <input v-model="company" type="text" placeholder="Empresa (opcional)"
                class="w-full rounded-xl border border-cream-50/15 bg-ink-900 px-4 py-3 text-[14px]" />
            </div>

            <div class="flex items-center justify-between border-t border-cream-50/10 pt-4">
              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-cream-50/50">Total estimado</p>
                <p class="font-display text-2xl font-semibold text-cream-50">{{ mxn(total) }}</p>
              </div>
              <p class="max-w-[45%] text-right text-[11px] leading-snug text-cream-50/50">
                IVA incluido · Cancelación gratuita hasta 24 h antes
              </p>
            </div>

            <p v-if="selectionConflict || bookingError" class="text-center text-[12px] font-medium text-terra-400">
              {{ selectionConflict || bookingError }}
            </p>
            <button
              class="w-full rounded-full bg-ink-900 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-bronze-600 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!name.trim() || !email.includes('@') || Boolean(selectionConflict) || bookingPending" @click="confirm">
              {{ bookingPending ? 'Reservando…' : 'Confirmar reserva' }}
            </button>
            <p class="text-center text-[11px] text-cream-50/50">Pago seguro con tarjeta · recibo por correo</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
