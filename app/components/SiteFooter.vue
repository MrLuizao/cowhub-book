<template>
  <footer class="bg-ink-900 text-cream-100">
    <div class="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">

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
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-bronze-300">Legal</p>
        <ul class="mt-4 space-y-3 text-sm text-cream-100/70">
          <li>
            <a href="#" target="_blank" rel="noopener" class="link-line">Aviso de privacidad</a>
          </li>
          <li>
            <a href="#" target="_blank" rel="noopener" class="link-line">Términos y condiciones</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div
        class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-10 sm:flex-row sm:items-center lg:px-8">
        <div>
          <BrandLogo size="md" />
          <p class="mt-1 max-w-md text-xs leading-relaxed text-cream-100/40">
            Business Center en el corazón de Metepec. <br />
            Oficinas privadas, salas de juntas y espacios flexibles listos para tu equipo.
          </p>
        </div>
        <div class="flex flex-col items-center self-center sm:items-end sm:self-auto">
          <a href="https://foundry-landing-pi.vercel.app/" target="_blank" rel="noopener noreferrer"
            class="inline-flex cursor-pointer items-center rounded-xl bg-white/[0.04] transition duration-300 hover:border-[#ff6b00]/70 hover:bg-white/[0.08]">
            <img src="/brand/fundere-original-dark.png" alt="FUNDERE Software Studio"
              class="h-10 w-auto object-contain mix-blend-screen transition duration-300 group-hover:scale-105 sm:h-12" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
