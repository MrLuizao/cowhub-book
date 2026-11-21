<script setup lang="ts">
import { resolveJourneyMedia, type JourneyMediaSet } from '~/data/journeyMedia'

const props = defineProps<{
  mediaSet?: JourneyMediaSet
}>()

const appConfig = useAppConfig()
const media = resolveJourneyMedia(props.mediaSet ?? appConfig.journeyMedia)

interface Parada {
  id: string
  lugar: string
  title: string
  text: string
  clip: string
  poster: string
}

const paradas: Parada[] = [
  {
    id: 'recepcion',
    lugar: 'La recepción',
    title: 'Bienvenida a tu nuevo espacio de trabajo',
    text: 'Recepción 24/7, registro de visitantes sin filas y café de barra incluido desde el primer minuto.',
    clip: `${media.videoBase}/paseo-1.mp4`,
    poster: `${media.posterBase}/paseo-1.jpg`,
  },
  {
    id: 'coworking',
    lugar: 'Coworking flexible',
    title: 'Hot desk y escritorios por día',
    text: 'Escritorios ergonómicos, WiFi dedicado y comunidad que crece cada semana. Reserva por hora o por día.',
    clip: `${media.videoBase}/paseo-2.mp4`,
    poster: `${media.posterBase}/paseo-2.jpg`,
  },
  {
    id: 'salas',
    lugar: 'Salas de juntas',
    title: 'Juntas que se ven y se sienten premium',
    text: 'Pantalla 4K, videoconferencia y mobiliario modular. Reservables por hora o día completo.',
    clip: `${media.videoBase}/paseo-3.mp4`,
    poster: `${media.posterBase}/paseo-3.jpg`,
  },
  {
    id: 'auditorio',
    lugar: 'Auditorio Metepec',
    title: 'Escenarios para lo que sigue',
    text: 'Butacas para 60 personas, iluminación LED y sonido profesional. Pitch days, workshops y conferencias.',
    clip: `${media.videoBase}/paseo-4.mp4`,
    poster: `${media.posterBase}/paseo-4.jpg`,
  },
  {
    id: 'cafe',
    lugar: 'Café de barra',
    title: 'El punto de encuentro de la comunidad',
    text: 'Café de especialidad, snacks y conversaciones que terminan en clientes. Incluido en todos los espacios.',
    clip: `${media.videoBase}/paseo-5.mp4`,
    poster: `${media.posterBase}/paseo-5.jpg`,
  },
  {
    id: 'terraza',
    lugar: 'Terraza y comunidad',
    title: 'El after office que tu equipo merecía',
    text: 'Terraza con vista al boulevard, café de grano y networking mensual entre empresas de la plaza.',
    clip: `${media.videoBase}/paseo-6.mp4`,
    poster: `${media.posterBase}/paseo-6.jpg`,
  },
]

const onSearch = (p: { date: string; category: string; guests: number }) => {
  navigateTo({
    path: '/espacios',
    query: { fecha: p.date, categoria: p.category === 'todos' ? undefined : p.category },
  })
}

const worldEl = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const stopEls = ref<HTMLElement[]>([])
const hintEl = ref<HTMLElement | null>(null)

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const piecewise = (y: number, keys: { y: number; v: number }[]) => {
  if (y <= keys[0].y) return keys[0].v
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1]
    const b = keys[i]
    if (y <= b.y) return a.v + ((b.v - a.v) * (y - a.y)) / (b.y - a.y || 1)
  }
  return keys[keys.length - 1].v
}

const n = paradas.length
const last = n - 1
let clips: HTMLVideoElement[] = []
let marks: number[] = []
let endY = 0
let w = 0
let current = -1
let active = 0
let shown = -1
let time = 0
const ready: boolean[] = []
const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const setCurrent = (index: number) => {
  if (index === current) return
  current = index
  stopEls.value.forEach((el, i) => el.classList.toggle('is-current', i === index))
}

const show = () => {
  if (shown !== active) {
    shown = active
    clips.forEach((c, i) => c.classList.toggle('is-shown', i === active))
  }
}

const sync = () => {
  const clip = clips[active]
  if (!clip || !ready[active]) return
  if (clip.seeking) return
  if (Math.abs(clip.currentTime - time) > 0.01) clip.currentTime = time
  else show()
}

const render = () => {
  if (!worldEl.value || !stageEl.value) return
  const sy = window.scrollY
  w = piecewise(sy, [...marks.map((y, i) => ({ y, v: i })), { y: endY, v: n }])
  const at = Math.min(w, last)

  setCurrent(Math.min(Math.round(at), last))
  if (hintEl.value) hintEl.value.style.opacity = String(clamp01(1 - w * 4))

  stageEl.value.querySelectorAll<HTMLElement>('[data-frame]').forEach((frame, i) => {
    frame.style.opacity = String(i === 0 ? 1 : clamp01((w - i + 0.5) / 0.5))
    if (!reduceMotion) frame.style.transform = `scale(${1 + 0.06 * clamp01(w - i)})`
  })

  if (!clips.length) return
  active = Math.min(clips.length - 1, Math.floor(w))
  const { duration } = clips[active]
  if (ready[active] && Number.isFinite(duration)) {
    time = Math.min((w - active) * duration, duration - 0.05)
  }
  sync()
}

const measure = () => {
  if (!worldEl.value || !stageEl.value) return
  const sy = window.scrollY
  const vh = window.innerHeight
  const worldTop = worldEl.value.getBoundingClientRect().top + sy
  const worldBottom = worldTop + worldEl.value.offsetHeight
  marks = stopEls.value.map((el) => el.getBoundingClientRect().top + sy)
  endY = worldBottom - vh
  render()
}

let raf = 0
const onScroll = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(render)
}

// Carga los clips de uno en uno, priorizando el más cercano al scroll actual.
const loadQueue = async () => {
  const distance = (i: number) => {
    if (i === active) return -1
    if (i > w) return i - w
    return w - (i + 1) + 0.5
  }
  const queue = clips.map((_, i) => i)
  while (queue.length) {
    queue.sort((a, b) => distance(a) - distance(b))
    const i = queue.shift()!
    const clip = clips[i]
    const src = clip.dataset.src ?? ''
    clip.preload = 'auto'
    try {
      const res = await fetch(src)
      if (!res.ok) throw new Error(res.statusText)
      clip.src = URL.createObjectURL(await res.blob())
    } catch {
      clip.src = src
    }
    const loaded = await new Promise<boolean>((resolve) => {
      clip.addEventListener('loadeddata', () => resolve(true), { once: true })
      clip.addEventListener('error', () => resolve(false), { once: true })
    })
    if (loaded) {
      await clip.play().catch(() => { })
      clip.pause()
      ready[i] = true
      render()
    }
  }
}

onMounted(() => {
  clips = Array.from(stageEl.value?.querySelectorAll<HTMLVideoElement>('[data-clip]') ?? [])
  clips.forEach((clip, i) => {
    clip.addEventListener('seeked', () => {
      if (i !== active) return
      show()
      sync()
    })
  })
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measure)
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData
  if (!reduceMotion && !saveData && clips.length) {
    if (document.readyState === 'complete') loadQueue()
    else window.addEventListener('load', loadQueue, { once: true })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', measure)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <section id="recorrido" ref="worldEl" aria-label="Recorrido virtual por el cowork" class="relative">
    <!-- Escenario fijo: posters debajo, clips de video encima. -->
    <div ref="stageEl" data-stage class="sticky top-0 h-[100svh] overflow-hidden bg-ink-900">
      <div aria-hidden="true" class="absolute inset-0">
        <div v-for="(p, i) in paradas" :key="'frame-' + p.id" data-frame class="absolute inset-0"
          :style="i === 0 ? undefined : 'opacity:0'">
          <img :src="p.poster" alt="" class="h-full w-full object-cover" :style="{ objectPosition: '50% 50%' }"
            :loading="i === 0 ? 'eager' : 'lazy'" />
        </div>
        <div class="clips absolute inset-0">
          <video v-for="p in paradas" :key="'clip-' + p.id" :data-clip="p.id" :data-src="p.clip" muted playsinline
            preload="none" disablepictureinpicture disableremoteplayback tabindex="-1"
            class="clip absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500" />
        </div>
      </div>

      <!-- Velos para leer el texto -->
      <div aria-hidden="true" class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-900/60 to-transparent" />
      <div aria-hidden="true"
        class="absolute inset-0 bg-gradient-to-t from-ink-900 from-15% via-ink-900/50 via-50% to-transparent to-80% lg:bg-gradient-to-r lg:from-ink-900/90 lg:via-ink-900/40 lg:via-35% lg:to-transparent lg:to-65%" />
      <div aria-hidden="true"
        class="absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-ink-900/80 to-transparent lg:block" />

      <p ref="hintEl" aria-hidden="true"
        class="absolute bottom-8 right-8 hidden items-center gap-3 text-[11px] tracking-[0.25em] text-cream-50/70 uppercase lg:flex">
        Desliza para recorrer
        <span class="hint-line relative block h-8 w-px overflow-hidden bg-cream-50/20">
          <span class="absolute inset-x-0 top-0 h-1/2 animate-[hint_1.6s_ease-in-out_infinite] bg-bronze-400" />
        </span>
      </p>
    </div>

    <!-- Paradas: cada una deja su texto abajo a la izquierda mientras el video avanza. -->
    <div class="relative z-10 -mt-[100svh]">
      <article v-for="(p, i) in paradas" :key="p.id" :id="p.id"
        :ref="(el) => { if (el) stopEls[i] = el as HTMLElement }" :data-stop="p.id"
        class="stop pointer-events-none flex min-h-[180svh] flex-col justify-end">
        <div
          class="stop-body pointer-events-auto sticky bottom-0 flex w-full max-w-2xl flex-col items-start px-4 pb-12 pt-32 md:px-12 lg:pb-16 xl:px-20"
          :class="i === n - 1 ? 'lg:max-w-5xl' : 'lg:max-w-3xl'">
          <template v-if="i === n - 1">
            <p class="flex items-center gap-2 text-[11px] tracking-[0.25em] text-cream-50/60 uppercase">
              <span class="tabular-nums">{{ String(i + 1).padStart(2, '0') }} / {{ String(n).padStart(2, '0') }}</span>
            </p>
            <h3 class="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-cream-50 lg:text-6xl">
              Salas de juntas, auditorio y coworking<br />
              <em class="font-normal italic text-bronze-300">de estándar hotelero</em><br />
              en el corazón de Metepec.
            </h3>
            <p class="mt-4 max-w-md text-[15px] leading-relaxed text-cream-50/75 lg:text-base">
              Reserva en segundos, llega y trabaja.
            </p>
            <!-- <div class="mt-8 w-full max-w-4xl">
              <BookingWidget @search="onSearch" />
            </div> -->
          </template>
          <template v-else>
            <p class="flex items-center gap-2 text-[11px] tracking-[0.25em] text-cream-50/60 uppercase">
              <span class="tabular-nums">{{ String(i + 1).padStart(2, '0') }} / {{ String(n).padStart(2, '0') }}</span>
            </p>
            <h3 class="mt-4 font-display text-4xl font-semibold leading-tight text-cream-50 lg:text-6xl">
              {{ p.title }}
            </h3>
            <p class="mt-4 max-w-md text-[15px] leading-relaxed text-cream-50/75 lg:text-base">
              {{ p.text }}
            </p>
          </template>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.clip.is-shown {
  opacity: 1;
}

.stop-body>* {
  opacity: 0;
  transform: translateY(2rem);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.stop.is-current .stop-body>* {
  opacity: 1;
  transform: none;
  transition-duration: 1s;
}

.stop.is-current .stop-body> :nth-child(2) {
  transition-delay: 60ms;
}

.stop.is-current .stop-body> :nth-child(3) {
  transition-delay: 120ms;
}

.stop.is-current .stop-body> :nth-child(4) {
  transition-delay: 180ms;
}

.stop:not(.is-current) .stop-body {
  pointer-events: none;
}

@keyframes hint {
  0% {
    transform: translateY(-100%);
  }

  60%,
  100% {
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stop-body>* {
    transform: none;
  }
}
</style>
