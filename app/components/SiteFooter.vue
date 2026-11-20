<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-ink-900 text-cream-100">
    <div class="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
      <div>
        <p class="font-display text-2xl font-bold">
          COW<span class="text-bronze-300">-</span>HUB
        </p>
        <p class="mt-3 max-w-xs text-sm leading-relaxed text-cream-100/60">
          Coworking en el corazón de Metepec. Oficinas, coworking y
          espacios reservables para el networking.
        </p>
      </div>
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-bronze-300">Espacios</p>
        <ul class="mt-4 space-y-3 text-sm text-cream-100/70">
          <li>
            <NuxtLink to="/espacios" class="link-line">Salas de juntas</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/espacios" class="link-line">Eventos y auditorio</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/espacios" class="link-line">Coworking por día</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/espacios" class="link-line">Cabinas de enfoque</NuxtLink>
          </li>
        </ul>
      </div>
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-bronze-300">Centro</p>
        <ul class="mt-4 space-y-3 text-sm text-cream-100/70">
          <li>
            <NuxtLink to="/amenidades" class="link-line">Amenidades</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/membresias" class="link-line">Membresías</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/testimonios" class="link-line">Testimonios</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/ubicacion" class="link-line">Ubicación</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/tour" class="link-line">Agendar tour</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/espacios" class="link-line">Reservar</NuxtLink>
          </li>
        </ul>
      </div>
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-bronze-300">Contacto</p>
        <ul class="mt-4 space-y-3 text-sm text-cream-100/70">
          <li>Paseo San Isidro 111, Metepec</li>
          <li>+52 (722) 222 0000</li>
          <li>info@cowhub.mx</li>
          <li class="pt-2 text-cream-100/40">Lun–Vie 7:00–21:00 · Sáb 9:00–15:00</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-[11px] uppercase tracking-[0.2em] text-cream-100/40 sm:flex-row lg:px-8">
        <p>© {{ year }} COW-HUB</p>
        <div class="flex gap-4">
          <a href="#" target="_blank" rel="noopener">Aviso de privacidad</a>
          |
          <a href="#" target="_blank" rel="noopener">Terminos y condiciones</a>
        </div>
      </div>
    </div>
  </footer>
</template>
