<script setup lang="ts">
useHead({ title: 'Agendar tour · COW-HUB' })

const INTEREST_OPTIONS = [
  'Hot Desk (Escritorio flexible)',
  'Membresía Coworking (Escritorio dedicado)',
  'Oficina privada (Equipos)',
  'Salas de juntas',
  'Eventos (Auditorio / Terraza)',
  'Cabinas Focus',
  'Recorrido general',
] as const

const form = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  date: '',
  guests: 2,
  interest: '',
  privacy: false,
})

const submitted = ref(false)
const folio = ref('')
const submitting = ref(false)
const submitError = ref('')
const errors = reactive<Record<string, string>>({})
const calendarRef = ref<{ refresh: () => Promise<void> } | null>(null)

function validate() {
  errors.name = form.name.trim() ? '' : 'Nombre requerido'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Correo válido requerido'
  errors.phone = form.phone.trim().length >= 10 ? '' : 'Teléfono de 10 dígitos'
  errors.date = form.date ? '' : 'Elige una fecha'
  errors.privacy = form.privacy ? '' : 'Debes aceptar el aviso de privacidad'
  return !Object.values(errors).some(Boolean)
}

async function submit() {
  if (!validate() || submitting.value) return
  submitError.value = ''
  submitting.value = true
  try {
    const api = usePublicApi()
    const res = await api.createTour({
      name: form.name,
      company: form.company || undefined,
      email: form.email,
      phone: form.phone,
      preferred_date: form.date || undefined,
      people: form.guests,
      interest: form.interest || undefined,
      privacy_accepted: form.privacy,
    })
    if (res && 'tour' in res && res.tour?.folio) {
      folio.value = res.tour.folio
      submitted.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      submitError.value = res && 'error' in res ? res.error : 'No se pudo conectar con el servidor para registrar el tour'
      await calendarRef.value?.refresh()
    }
  } catch (err: unknown) {
    submitError.value = 'Error al procesar la solicitud con el servidor'
  } finally {
    submitting.value = false
  }
}

const today = new Date().toISOString().slice(0, 10)
</script>

<template>
  <div class="bg-ink-900">
    <PageHero eyebrow="Agenda un tour" image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
      description="Te mostramos oficinas, coworking, salas y comunidad en una visita de 30 minutos. Sin compromiso, con café de por medio.">
      Conoce el espacio antes<br />de <em class="italic text-bronze-300">decidir.</em>
    </PageHero>

    <section class="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <!-- Confirmación -->
      <div v-if="submitted" class="mx-auto max-w-2xl">
        <div class="rounded-3xl border border-sage-500/30 bg-sage-500/10 p-12 text-center">
          <span class="text-4xl">📅</span>
          <h2 class="mt-4 font-display text-4xl font-semibold text-cream-50">Tour agendado</h2>
          <p class="mt-3 text-cream-50/70">">
            {{ new Date(form.date + 'T12:00:00').toLocaleDateString('es-MX', {
              weekday: 'long', day: 'numeric', month:
                'long'
            }) }}
            · {{ form.guests }} {{ form.guests === 1 ? 'persona' : 'personas' }}
          </p>
          <p
            class="mt-6 inline-block rounded-full bg-ink-900 px-6 py-3 font-mono text-sm tracking-[0.2em] text-cream-50 ring-1 ring-cream-50/15">
            {{ folio }}
          </p>
          <p class="mt-4 text-sm text-cream-50/60">
            Te confirmaremos por correo a <b class="text-cream-50">{{ form.email }}</b> con la hora exacta.
            Te esperamos en Paseo San Isidro 111, Metepec.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-4">
            <NuxtLink to="/espacios"
              class="rounded-full bg-bronze-500 px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-900 hover:bg-bronze-400">
              Mientras tanto, explora espacios
            </NuxtLink>
            <NuxtLink to="/"
              class="rounded-full border border-cream-50/25 px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream-50 hover:border-cream-50">
              Volver al inicio
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <div v-else class="reveal-group mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr]">
        <!-- Col info -->
        <div class="space-y-8">
          <div>
            <h2 class="font-display text-3xl font-semibold text-cream-50">¿Qué incluye la visita?</h2>
            <ul class="mt-6 space-y-4">
              <li v-for="item in [
                'Recorrido guiado por oficinas, coworking y áreas comunes',
                'Demo de salas de juntas, auditorio y terraza',
                'Conoce a la comunidad: empresas que ya trabajan aquí',
                'Café de barra y conversación sin compromiso',
              ]" :key="item" class="flex items-start gap-4 text-[15px] text-cream-50/75">
                <span
                  class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-bronze-500/15 text-bronze-400">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {{ item }}
              </li>
            </ul>
          </div>
          <div class="rounded-2xl border border-cream-50/10 bg-ink-800/60 p-7">
            <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-bronze-300">Horarios de visita</p>
            <div class="mt-4 space-y-2 text-sm text-cream-50/70">
              <p class="flex justify-between"><span>Lunes a viernes</span><b class="text-cream-50">9:00 – 19:00</b></p>
              <p class="flex justify-between"><span>Sábados</span><b class="text-cream-50">10:00 – 14:00</b></p>
              <p class="flex justify-between"><span>Domingos</span><b class="text-cream-50">Cerrado</b></p>
            </div>
          </div>
          <div class="rounded-2xl border border-cream-50/10 bg-ink-800/60 p-7">
            <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-bronze-300">¿Prefieres llamada?</p>
            <p class="mt-3 text-sm text-cream-50/70">
              Escríbenos por WhatsApp o llámanos y te agendamos en 2 minutos.
            </p>
            <a href="tel:+527222220000"
              class="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-bronze-300 hover:text-bronze-400">
              +52 (722) 222 0000
            </a>
          </div>
        </div>

        <!-- Form -->
        <form class="widget-shell rounded-3xl p-8 lg:p-10" @submit.prevent="submit">
          <h2 class="font-display text-2xl font-semibold text-cream-50">Tus datos</h2>
          <p class="mt-2 text-sm text-cream-50/55">Te contactamos para confirmar fecha y hora exacta.</p>

          <div class="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Nombre
                completo *</label>
              <input v-model="form.name" type="text" placeholder="Ana García"
                class="mt-1.5 w-full rounded-xl border bg-ink-900 px-4 py-3.5 text-[14px] text-cream-50 placeholder:text-cream-50/30"
                :class="errors.name ? 'border-terra-500' : 'border-cream-50/15'" />
              <p v-if="errors.name" class="mt-1 text-[11px] text-terra-400">{{ errors.name }}</p>
            </div>
            <div>
              <label
                class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Empresa</label>
              <input v-model="form.company" type="text" placeholder="Estudio Norte"
                class="mt-1.5 w-full rounded-xl border border-cream-50/15 bg-ink-900 px-4 py-3.5 text-[14px] text-cream-50 placeholder:text-cream-50/30" />
            </div>
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Correo
                electrónico *</label>
              <input v-model="form.email" type="email" placeholder="ana@empresa.com"
                class="mt-1.5 w-full rounded-xl border bg-ink-900 px-4 py-3.5 text-[14px] text-cream-50 placeholder:text-cream-50/30"
                :class="errors.email ? 'border-terra-500' : 'border-cream-50/15'" />
              <p v-if="errors.email" class="mt-1 text-[11px] text-terra-400">{{ errors.email }}</p>
            </div>
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Teléfono /
                WhatsApp *</label>
              <input v-model="form.phone" type="tel" placeholder="722 000 0000"
                class="mt-1.5 w-full rounded-xl border bg-ink-900 px-4 py-3.5 text-[14px] text-cream-50 placeholder:text-cream-50/30"
                :class="errors.phone ? 'border-terra-500' : 'border-cream-50/15'" />
              <p v-if="errors.phone" class="mt-1 text-[11px] text-terra-400">{{ errors.phone }}</p>
            </div>

            <div>
              <label for="tour-interest"
                class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">¿Qué te
                interesa?</label>
              <USelect
                id="tour-interest"
                v-model="form.interest"
                :items="[...INTEREST_OPTIONS]"
                placeholder="Selecciona una opción…"
                size="xl"
                class="mt-1.5 w-full"
                :ui="{ base: 'h-12 rounded-xl border border-cream-50/15 bg-ink-900 px-4 text-[14px] text-cream-50 ring-0 shadow-none' }"
              />
            </div>

            <div>
              <label
                class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Personas</label>
              <UInputNumber
                v-model="form.guests"
                :min="1"
                :max="10"
                size="xl"
                class="mt-1.5 w-full"
                :ui="{ base: 'h-12 rounded-xl border border-cream-50/15 bg-ink-900 text-[14px] font-semibold text-cream-50 ring-0 shadow-none' }"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/50">Fecha
                preferida *</label>
              <div class="mt-1.5">
                <TourCalendar ref="calendarRef" v-model="form.date" :min-date="today" :has-error="Boolean(errors.date)" />
              </div>
              <p v-if="errors.date" class="mt-1 text-[11px] text-terra-400">{{ errors.date }}</p>
            </div>

          </div>

          <label class="mt-5 flex items-start gap-3">
            <input v-model="form.privacy" type="checkbox" class="mt-0.5 h-4 w-4 accent-[#b04f33]" />
            <span class="text-[12px] leading-relaxed text-cream-50/60">
              Acepto el aviso de privacidad y el tratamiento de mis datos para agendar mi visita.
            </span>
          </label>
          <p v-if="errors.privacy" class="mt-1 text-[11px] text-terra-400">{{ errors.privacy }}</p>

          <p v-if="submitError" class="mt-4 text-center text-[12px] font-medium text-red-400">
            {{ submitError }}
          </p>
          <button type="submit" :disabled="submitting"
            class="mt-7 w-full rounded-full bg-bronze-500 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-900 transition hover:bg-bronze-400 disabled:cursor-not-allowed disabled:opacity-50">
            {{ submitting ? 'Agendando…' : 'Agendar mi tour' }}
          </button>
          <p class="mt-4 text-center text-[11px] text-cream-50/40">Sin compromiso · Respondemos en menos de 24 h</p>
        </form>
      </div>
    </section>
  </div>
</template>
