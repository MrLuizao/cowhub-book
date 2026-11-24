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
    title: 'Tu primera impresión, resuelta.',
    text: 'Recepción ejecutiva, acceso ágil para tus visitas y café de barra listo desde que cruzas la puerta.',
    clip: `${media.videoBase}/paseo-1.mp4`,
    poster: `${media.posterBase}/paseo-1.jpg`,
  },
  {
    id: 'coworking',
    lugar: 'Coworking flexible',
    title: 'Trabaja a tu ritmo, sin distracciones.',
    text: 'Escritorios ergonómicos, internet dedicado y un entorno profesional para avanzar desde el primer día. Reserva por hora o por día.',
    clip: `${media.videoBase}/paseo-2.mp4`,
    poster: `${media.posterBase}/paseo-2.jpg`,
  },
  {
    id: 'salas',
    lugar: 'Salas de juntas',
    title: 'Reuniones a la altura de tus clientes.',
    text: 'Pantallas 4K, audio nítido y mobiliario configurable para presentaciones o juntas de consejo.',
    clip: `${media.videoBase}/paseo-3.mp4`,
    poster: `${media.posterBase}/paseo-3.jpg`,
  },
  {
    id: 'auditorio',
    lugar: 'Auditorio Metepec',
    title: 'Un escenario listo para tu próximo evento.',
    text: 'Capacidad para 60 personas, iluminación profesional y acústica cuidada para lanzamientos, talleres y conferencias.',
    clip: `${media.videoBase}/paseo-4.mp4`,
    poster: `${media.posterBase}/paseo-4.jpg`,
  },
  {
    id: 'cafe',
    lugar: 'Café de barra',
    title: 'Pausa, café y buenas conversaciones.',
    text: 'Barra de café de especialidad y áreas lounge pensadas para desconectar cinco minutos o cerrar un trato.',
    clip: `${media.videoBase}/paseo-5.mp4`,
    poster: `${media.posterBase}/paseo-5.jpg`,
  },
  {
    id: 'terraza',
    lugar: 'Terraza y comunidad',
    title: 'El punto de encuentro de tu equipo.',
    text: 'Terraza abierta sobre el boulevard para eventos privados, networking y cierres de semana.',
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
let isMobile = false
let lastWidth = 0
let unlocked = false
const ready: boolean[] = []
const loading: boolean[] = []
const blobUrls: string[] = []
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
  const threshold = isMobile ? 0.04 : 0.01
  if (Math.abs(clip.currentTime - time) > threshold) {
    try {
      clip.currentTime = time
    } catch {
      // Safari can throw InvalidStateError if metadata isn't ready yet
    }
  } else {
    show()
  }
}

const primeClip = async (clip: HTMLVideoElement) => {
  clip.muted = true
  clip.playsInline = true
  try {
    await clip.play()
    clip.pause()
    unlocked = true
  } catch {
    // Autoplay blocked (e.g. iOS Low Power Mode) — will unlock on first touch
  }
}

const loadMobileClip = async (i: number) => {
  const clip = clips[i]
  if (!clip || ready[i] || loading[i]) return
  const src = clip.dataset.src ?? ''
  if (!src) return

  loading[i] = true
  clip.muted = true
  clip.playsInline = true
  clip.preload = 'auto'
  if (clip.getAttribute('src') !== src) {
    clip.src = src
    clip.load()
  }

  const loaded = await new Promise<boolean>((resolve) => {
    if (clip.readyState >= 2) return resolve(true)
    let settled = false
    const done = (ok: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      clip.removeEventListener('loadeddata', onReady)
      clip.removeEventListener('canplay', onReady)
      clip.removeEventListener('loadedmetadata', onMeta)
      clip.removeEventListener('error', onError)
      resolve(ok)
    }
    const onReady = () => done(true)
    const onMeta = () => {
      // iOS sometimes stops at HAVE_METADATA until play() is attempted
      primeClip(clip).then(() => {
        if (clip.readyState >= 2) done(true)
      })
    }
    const onError = () => done(false)
    const timer = window.setTimeout(() => done(clip.readyState >= 1), 6000)

    clip.addEventListener('loadeddata', onReady)
    clip.addEventListener('canplay', onReady)
    clip.addEventListener('loadedmetadata', onMeta)
    clip.addEventListener('error', onError)
  })

  loading[i] = false
  if (loaded && clip.getAttribute('src') === src) {
    await primeClip(clip)
    ready[i] = true
    if (i === active) render()
  }
}

const updateMobileWindow = () => {
  if (!isMobile || !clips.length) return
  // Mantener solo el clip activo y sus vecinos inmediatos para no saturar decodificadores en iOS.
  const keep = new Set([active, Math.min(last, active + 1), Math.max(0, active - 1)])
  clips.forEach((clip, i) => {
    if (!keep.has(i) && (ready[i] || clip.getAttribute('src'))) {
      ready[i] = false
      loading[i] = false
      clip.classList.remove('is-shown')
      if (shown === i) shown = -1
      clip.removeAttribute('src')
      clip.load()
    }
  })
  // Priorizar el clip actual y luego el siguiente.
  loadMobileClip(active).then(() => {
    if (active + 1 <= last) loadMobileClip(active + 1)
    if (active - 1 >= 0) loadMobileClip(active - 1)
  })
}

const onFirstInteraction = () => {
  if (unlocked) {
    window.removeEventListener('touchstart', onFirstInteraction)
    window.removeEventListener('pointerdown', onFirstInteraction)
    return
  }
  const clip = clips[active]
  if (clip && clip.getAttribute('src')) {
    primeClip(clip).then(() => {
      if (unlocked) {
        window.removeEventListener('touchstart', onFirstInteraction)
        window.removeEventListener('pointerdown', onFirstInteraction)
      }
      if (clip.readyState >= 1) {
        ready[active] = true
        render()
      }
    })
  }
}

const render = () => {
  if (!worldEl.value || !stageEl.value) return
  const sy = window.scrollY
  w = piecewise(sy, [...marks.map((y, i) => ({ y, v: i })), { y: endY, v: n }])
  const at = Math.min(w, last)

  setCurrent(Math.min(Math.round(at), last))

  stageEl.value.querySelectorAll<HTMLElement>('[data-frame]').forEach((frame, i) => {
    frame.style.opacity = String(i === 0 ? 1 : clamp01((w - i + 0.5) / 0.5))
    if (!reduceMotion) frame.style.transform = `scale(${1 + 0.06 * clamp01(w - i)})`
  })

  if (!clips.length) return
  const nextActive = Math.min(clips.length - 1, Math.floor(w))
  const activeChanged = nextActive !== active
  active = nextActive
  if (activeChanged && isMobile) updateMobileWindow()

  const { duration } = clips[active]
  if (ready[active] && Number.isFinite(duration) && duration > 0) {
    time = Math.min(Math.max(0, (w - active) * duration), duration - 0.05)
  }
  sync()
}

const measure = () => {
  if (!worldEl.value || !stageEl.value) return
  lastWidth = window.innerWidth
  const sy = window.scrollY
  const vh = stageEl.value.offsetHeight || window.innerHeight
  const worldTop = worldEl.value.getBoundingClientRect().top + sy
  const worldBottom = worldTop + worldEl.value.offsetHeight
  marks = stopEls.value.map((el) => el.getBoundingClientRect().top + sy)
  endY = worldBottom - vh
  render()
}

const onResize = () => {
  // En móvil, ocultar/mostrar la barra de direcciones dispara resize solo en alto.
  if (isMobile && Math.abs(window.innerWidth - lastWidth) < 2) return
  measure()
}

let raf = 0
const onScroll = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(render)
}

// Desktop: precarga los clips de uno en uno en memoria, priorizando el más cercano al scroll actual.
const loadDesktopQueue = async () => {
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
      const objectUrl = URL.createObjectURL(await res.blob())
      blobUrls.push(objectUrl)
      clip.src = objectUrl
    } catch {
      clip.src = src
    }
    const loaded = await new Promise<boolean>((resolve) => {
      if (clip.readyState >= 2) return resolve(true)
      const timer = window.setTimeout(() => resolve(clip.readyState >= 1), 10000)
      const finish = (ok: boolean) => {
        clearTimeout(timer)
        resolve(ok)
      }
      clip.addEventListener('loadeddata', () => finish(true), { once: true })
      clip.addEventListener('error', () => finish(false), { once: true })
    })
    if (loaded) {
      await primeClip(clip)
      ready[i] = true
      render()
    }
  }
}

onMounted(() => {
  isMobile =
    window.matchMedia('(pointer: coarse)').matches ||
    /iP(ad|hone|od)|Android/i.test(navigator.userAgent)

  clips = Array.from(stageEl.value?.querySelectorAll<HTMLVideoElement>('[data-clip]') ?? [])
  clips.forEach((clip, i) => {
    clip.muted = true
    clip.playsInline = true
    clip.addEventListener('seeked', () => {
      if (i !== active) return
      show()
      sync()
    })
  })
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', measure)
  if (isMobile) {
    window.addEventListener('touchstart', onFirstInteraction, { passive: true })
    window.addEventListener('pointerdown', onFirstInteraction, { passive: true })
  }

  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData
  if (!reduceMotion && !saveData && clips.length) {
    if (isMobile) {
      updateMobileWindow()
    } else if (document.readyState === 'complete') {
      loadDesktopQueue()
    } else {
      window.addEventListener('load', loadDesktopQueue, { once: true })
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('orientationchange', measure)
  window.removeEventListener('touchstart', onFirstInteraction)
  window.removeEventListener('pointerdown', onFirstInteraction)
  cancelAnimationFrame(raf)
  blobUrls.forEach((url) => URL.revokeObjectURL(url))
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
            webkit-playsinline preload="none" disablepictureinpicture disableremoteplayback tabindex="-1"
            class="clip absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500" />
        </div>
      </div>

      <!-- Velos para leer el texto -->
      <div aria-hidden="true"
        class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-900/60 to-transparent lg:h-40" />
      <div aria-hidden="true"
        class="absolute inset-0 bg-gradient-to-t from-ink-900/95 from-10% via-ink-900/35 via-42% to-transparent to-72% lg:bg-gradient-to-r lg:from-ink-900/90 lg:via-ink-900/40 lg:via-35% lg:to-transparent lg:to-65%" />
      <div aria-hidden="true"
        class="absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-ink-900/80 to-transparent lg:block" />
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
            <h3 class="max-w-3xl font-display text-4xl font-semibold leading-tight text-cream-50 lg:text-6xl">
              Oficinas, cabinas y <br />
              <em class="font-normal italic text-bronze-300">las mejores amenidades</em><br />
              en el corazón de Metepec.
            </h3>
            <p class="mt-4 max-w-md text-[15px] leading-relaxed text-cream-50/75 lg:text-base">
              Elige tu espacio, reserva en línea y llega directo a trabajar.
            </p>
            <!-- <div class="mt-8 w-full max-w-4xl">
              <BookingWidget @search="onSearch" />
            </div> -->
          </template>
          <template v-else>
            <h3 class="font-display text-4xl font-semibold leading-tight text-cream-50 lg:text-6xl">
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
