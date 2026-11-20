<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow: string
    description?: string
    image?: string
  }>(),
  {
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
  },
)
</script>

<template>
  <section class="relative overflow-hidden pb-16 lg:pb-20">
    <img :src="image" alt="" class="absolute inset-0 h-full w-full object-cover opacity-25" />
    <div class="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/80 to-ink-900" />
    <div class="relative mx-auto max-w-7xl px-5 pt-36 lg:px-8 lg:pt-44">
      <p class="reveal text-[11px] font-semibold uppercase tracking-[0.35em] text-bronze-300">{{ eyebrow }}</p>
      <h1 v-reveal-lines
        class="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight text-cream-50 sm:text-6xl">
        <slot />
      </h1>
      <p v-if="description" class="reveal mt-5 max-w-xl text-[15px] leading-relaxed text-cream-50/70">
        {{ description }}
      </p>
    </div>
  </section>
</template>
