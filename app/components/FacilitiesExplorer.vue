<script setup lang="ts">
interface Facility {
  id: string
  name: string
  icon: keyof typeof ICONS
  image: string
  description: string
}

const ICONS = {
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  mug: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4a1 1 0 01-2 0v-4H7v4a1 1 0 01-2 0v-4H3a2 2 0 01-2-2v-6a2 2 0 012-2h2V4a1 1 0 012 0v4h10V4a1 1 0 012 0v4z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  mic: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
  sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  printer: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
  wifi: 'M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 19.5h.008v.008H12V19.5z',
  pin: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
}

const facilities: Facility[] = [
  {
    id: 'recepcion',
    name: 'Recepción 24/7',
    icon: 'bell',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
    description:
      'Atención personalizada las 24 horas. Registro de visitantes, paquetería, citas y recomendaciones locales.',
  },
  {
    id: 'cafe',
    name: 'Café de barra',
    icon: 'mug',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&q=80',
    description:
      'Café de especialidad, snacks y opciones saludables en la barra principal. Incluido en todos los espacios reservados.',
  },
  {
    id: 'salas',
    name: 'Salas de juntas',
    icon: 'chart',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1400&q=80',
    description:
      'Tres salas equipadas con pantalla 4K, videoconferencia y mobiliario modular. Reservables por hora o día completo.',
  },
  {
    id: 'auditorio',
    name: 'Auditorio',
    icon: 'mic',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1400&q=80',
    description:
      'Escenario con iluminación LED, sonido PA y butacas para 60 personas. Eventos, pitch days y conferencias.',
  },
  {
    id: 'terraza',
    name: 'Terraza y jardín',
    icon: 'sun',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1400&q=80',
    description:
      'Área exterior con café de grano, sombreadero retráctil y vista al boulevard. Ideal para networking y after office.',
  },
  {
    id: 'lockers',
    name: 'Lockers y lockers smart',
    icon: 'lock',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80',
    description:
      'Cajones individuales con acceso por QR desde tu app. Perfectos para equipo, documentos y pertenencias del día.',
  },
  {
    id: 'imprenta',
    name: 'Impresión y escaneo',
    icon: 'printer',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80',
    description:
      'Estación de impresión a color, escaneo y engargolado. Pago por hoja o paquete mensual para empresas.',
  },
  {
    id: 'wifi',
    name: 'WiFi dedicado',
    icon: 'wifi',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1400&q=80',
    description:
      'Red empresarial con SLA, segmentada por empresa y con respaldo 4G. Ideal para video llamadas y trabajo pesado.',
  },
  {
    id: 'estacionamiento',
    name: 'Estacionamiento',
    icon: 'pin',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1400&q=80',
    description:
      'Cajones exclusivos para miembros con acceso 24/7 y valet opcional en horarios pico.',
  },
  {
    id: 'comunidad',
    name: 'Comunidad y eventos',
    icon: 'users',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80',
    description:
      'After offices, workshops y networking mensual entre empresas de la plaza. Tú eliges dónde aparecer.',
  },
]

const activeId = ref(facilities[0].id)
const active = computed(() => facilities.find((f) => f.id === activeId.value)!)
</script>

<template>
  <div class="grid gap-12 lg:grid-cols-[minmax(300px,400px)_1fr] lg:gap-16">
    <!-- Lista vertical: filas planas, sin tarjetas -->
    <ul class="content-start">
      <li v-for="f in facilities" :key="f.id">
        <button
          class="group flex w-full items-center gap-4 py-3.5 text-left transition-colors duration-300"
          @click="activeId = f.id"
          @mouseenter="activeId = f.id"
        >
          <svg
            class="h-5 w-5 shrink-0 transition-colors duration-300"
            :class="activeId === f.id ? 'text-bronze-400' : 'text-cream-50/25 group-hover:text-cream-50/50'"
            fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS[f.icon]" />
          </svg>
          <span
            class="flex-1 text-[15px] font-medium leading-snug transition-colors duration-300"
            :class="activeId === f.id ? 'text-bronze-100' : 'text-cream-50/45 group-hover:text-cream-50/75'"
          >{{ f.name }}</span>
          <svg
            class="h-4 w-4 shrink-0 transition-all duration-300"
            :class="activeId === f.id ? 'translate-x-0 text-bronze-400 opacity-100' : '-translate-x-1 opacity-0'"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </li>
    </ul>

    <!-- Detalle: título + descripción arriba, foto abajo -->
    <div>
      <Transition name="detail" mode="out-in">
        <div :key="active.id">
          <h3 class="max-w-xl font-display text-4xl font-semibold leading-tight text-cream-50 sm:text-5xl">
            {{ active.name }}
          </h3>
          <p class="mt-5 max-w-xl text-[15px] leading-relaxed text-cream-50/60">
            {{ active.description }}
          </p>
        </div>
      </Transition>

      <div class="relative mt-10 overflow-hidden rounded-3xl">
        <Transition name="photo" mode="out-in">
          <img
            :key="active.id"
            :src="active.image"
            :alt="active.name"
            class="aspect-[16/10] w-full object-cover"
          />
        </Transition>
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-enter-active,
.detail-leave-active,
.photo-enter-active,
.photo-leave-active {
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.detail-enter-from {
  opacity: 0;
  transform: translateY(14px);
}
.detail-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.photo-enter-from {
  opacity: 0;
  transform: scale(1.03);
}
.photo-leave-to {
  opacity: 0;
}
</style>
