<script setup lang="ts">
const route = useRoute()
const open = ref(false)
const scrolled = ref(false)

onMounted(() => {
  const onScroll = () => (scrolled.value = window.scrollY > 24)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  return () => window.removeEventListener('scroll', onScroll)
})

watch(() => route.fullPath, () => (open.value = false))

const links = [
  { label: 'Espacios', to: '/espacios' },
  { label: 'Amenidades', to: '/amenidades' },
  { label: 'Membresías', to: '/membresias' },
  { label: 'Ubicación', to: '/ubicacion' },
]
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    :class="scrolled || open ? 'bg-ink-900/85 backdrop-blur-md border-b border-cream-50/10' : 'bg-transparent'">
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 lg:gap-6 lg:px-8">
      <NuxtLink to="/" aria-label="COW-HUB Inicio" class="flex shrink-0 items-center">
        <BrandLogo size="md" />
      </NuxtLink>

      <div class="flex items-center gap-5 xl:gap-8">
        <nav class="hidden items-center gap-5 lg:flex xl:gap-8">
          <NuxtLink v-for="l in links" :key="l.label" :to="l.to"
            class="link-line whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.14em] text-cream-50/70 transition hover:text-cream-50 xl:text-[13px]">
            {{ l.label }}
          </NuxtLink>
        </nav>
        <div class="flex shrink-0 items-center gap-2.5 xl:gap-3">
        <NuxtLink to="/tour"
          class="hidden whitespace-nowrap rounded-full border border-bronze-500/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-bronze-300 transition hover:bg-bronze-500 hover:text-ink-900 sm:block xl:px-6 xl:text-[12px]">
          Agendar tour
        </NuxtLink>
        <NuxtLink to="/espacios"
          class="hidden whitespace-nowrap rounded-full bg-cream-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-900 transition hover:bg-bronze-400 sm:block xl:px-6 xl:text-[12px]">
          Reservar ahora
        </NuxtLink>
        <button class="grid h-10 w-10 place-items-center lg:hidden" aria-label="Menú" @click="open = !open">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path v-if="!open" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
            <path v-else stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="open" class="border-t border-cream-50/10 bg-ink-900/95 px-5 pb-8 pt-4 lg:hidden">
        <NuxtLink v-for="l in links" :key="l.label" :to="l.to"
          class="block border-b border-cream-50/10 py-4 font-display text-2xl text-cream-50" @click="open = false">
          {{ l.label }}
        </NuxtLink>
        <NuxtLink to="/tour"
          class="mt-6 block rounded-full border border-bronze-500/60 px-6 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-bronze-300"
          @click="open = false">
          Agendar tour
        </NuxtLink>
        <NuxtLink to="/espacios"
          class="mt-3 block rounded-full bg-cream-50 px-6 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-900"
          @click="open = false">
          Reservar ahora
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
