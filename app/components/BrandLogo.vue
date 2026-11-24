<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
  }>(),
  {
    size: 'md',
    showText: true,
  },
)
</script>

<template>
  <span class="inline-flex items-center gap-3.5 select-none">
    <!-- 01 — El Portal: arcos arquitectónicos concéntricos + núcleo bronce -->
    <svg
      :class="{
        'h-7 w-7': size === 'sm',
        'h-8 w-8': size === 'md',
        'h-10 w-10': size === 'lg',
      }"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <!-- Arco exterior -->
      <path
        d="M8.5 31V15.5C8.5 10.2533 12.7533 6 18 6C23.2467 6 27.5 10.2533 27.5 15.5V31H24.2"
        class="stroke-bronze-400"
        stroke-width="1.5"
        stroke-linecap="square"
      />
      <!-- Arco interior -->
      <path
        d="M11.8 31H8.5M12.2 31V15.8C12.2 12.5967 14.7967 10 18 10C21.2033 10 23.8 12.5967 23.8 15.8V31"
        class="stroke-bronze-400"
        stroke-width="1.5"
        stroke-linecap="square"
      />
      <!-- Núcleo del Hub -->
      <circle cx="18" cy="19.5" r="2.2" class="fill-bronze-400" />
    </svg>

    <span
      v-if="showText"
      class="brand-wordmark font-normal uppercase tracking-[0.22em] text-cream-50"
      :class="{
        'text-lg': size === 'sm',
        'text-xl sm:text-[22px]': size === 'md',
        'text-2xl': size === 'lg',
      }"
    >
      COW<span class="text-bronze-400">HUB</span>
    </span>
  </span>
</template>

<style scoped>
.brand-wordmark {
  font-family: 'Marcellus', var(--font-display);
}
</style>
