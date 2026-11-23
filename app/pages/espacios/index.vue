<script setup lang="ts">
useHead({ title: 'COW-HUB · Reservaciones' })

const api = usePublicApi()
const { data: remote } = await useAsyncData('public-spaces', () => api.listSpaces())
const spaces = computed(() => remote.value ?? [])

const featured = computed(() => spaces.value.filter((s) => s.featured))
const filters = [
  { id: 'todos', label: 'Todos' },
  { id: 'sala-juntas', label: 'Salas de juntas' },
  { id: 'evento', label: 'Eventos' },
  { id: 'escritorio', label: 'Escritorios' },
  { id: 'focus', label: 'Concentración' },
]
const active = ref('todos')
const route = useRoute()

onMounted(() => {
  if (route.query.categoria) active.value = String(route.query.categoria)
})

const filtered = computed(() =>
  active.value === 'todos' ? spaces.value : spaces.value.filter((s) => s.category === active.value),
)

const mxn = (n: number) => '$' + n.toLocaleString('es-MX')
</script>

<template>
  <div>
    <PageHero eyebrow="Reservaciones" image="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80"
      description="Salas de juntas, auditorio, terraza y escritorios flexibles. Reserva por hora o por día, con café de barra y comunidad incluida.">
      Espacios que se sienten como hotel,<br /><em class="text-bronze-300">no como oficina prestada.</em>
    </PageHero>

    <div class="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div class="mt-4 flex flex-wrap gap-2">
        <button v-for="f in filters" :key="f.id"
          class="rounded-full border px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition"
          :class="active === f.id ? 'border-bronze-500/60 bg-bronze-500/10 text-bronze-300' : 'border-cream-50/15 text-cream-50/70 hover:border-cream-50/40 hover:text-cream-50'"
          @click="active = f.id">
          {{ f.label }}
        </button>
      </div>

      <div class="reveal-group mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <SpaceCard v-for="s in filtered" :key="s.id" :space="s" />
      </div>

      <section v-if="featured.length" class="mt-20">
        <div class="rule pt-14">
          <p class="reveal text-[11px] font-semibold uppercase tracking-[0.3em] text-bronze-400">Destacados</p>
          <h2 v-reveal-lines class="mt-3 font-display text-3xl font-semibold text-cream-50">Los favoritos de la
            comunidad
          </h2>
        </div>
        <div class="reveal-group mt-8 grid gap-10 lg:grid-cols-2">
          <article v-for="s in featured.slice(0, 2)" :key="'feat-' + s.id"
            class="group grid overflow-hidden rounded-3xl bg-ink-800 sm:grid-cols-2">
            <div class="relative aspect-[4/3] overflow-hidden sm:aspect-auto sm:min-h-[320px]">
              <img :src="s.image" :alt="s.name"
                class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy" />
            </div>
            <div class="flex flex-col justify-center p-8 lg:p-10">
              <p class="text-[11px] uppercase tracking-[0.2em] text-bronze-400">{{ s.tagline }}</p>
              <h3 class="mt-3 font-display text-3xl font-semibold text-cream-50">{{ s.name }}</h3>
              <p class="mt-4 line-clamp-3 text-sm leading-relaxed text-cream-50/60">{{ s.description }}</p>
              <div class="mt-6 flex items-center justify-between">
                <p class="text-sm text-cream-50/60">Hasta <b class="text-cream-50">{{ s.capacity }}</b> personas</p>
                <p class="font-display text-2xl font-semibold text-cream-50">{{ mxn(s.pricePerHour) }}<span
                    class="text-sm font-normal text-cream-50/50">/h</span></p>
              </div>
              <NuxtLink :to="`/espacios/${s.id}`"
                class="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-bronze-600">
                Ver espacio
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
