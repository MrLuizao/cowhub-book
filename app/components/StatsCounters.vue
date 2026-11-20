<script setup lang="ts">
const props = defineProps<{
  stats: { value: number; suffix?: string; label: string }[]
}>()

const display = ref(props.stats.map(() => 0))
const started = ref(false)

function animate() {
  if (started.value) return
  started.value = true
  props.stats.forEach((s, i) => {
    const target = s.value
    const dur = 1600
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      display.value[i] = Math.round(target * eased)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

const root = ref<HTMLElement>()
onMounted(() => {
  const io = new IntersectionObserver(
    ([e]) => e.isIntersecting && animate(),
    { threshold: 0.3 },
  )
  if (root.value) io.observe(root.value)
})

const fmt = (n: number) => n.toLocaleString('es-MX')
</script>

<template>
  <div ref="root" class="grid grid-cols-2 gap-8 lg:grid-cols-4">
    <div v-for="(s, i) in stats" :key="s.label">
      <p class="font-display text-5xl font-semibold text-cream-50">
        {{ fmt(display[i]) }}<span v-if="s.suffix" class="text-bronze-400">{{ s.suffix }}</span>
      </p>
      <p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">{{ s.label }}</p>
    </div>
  </div>
</template>
