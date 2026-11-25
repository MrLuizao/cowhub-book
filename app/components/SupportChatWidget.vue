<script setup lang="ts">
import type { SupportChatMessage } from '~/composables/usePublicApi'

interface StoredSession {
  conversationId: string
  visitorToken: string
  name: string
}

const STORAGE_KEY = 'cowhub_support_chat_v1'
const POLL_OPEN_MS = 3000
const POLL_MINIMIZED_MS = 10000

const api = usePublicApi()
const journeyFinished = useState<boolean>('journey-finished', () => true)

const open = ref(false)
const showLauncher = computed(() => !open.value && journeyFinished.value)
const session = ref<StoredSession | null>(null)
const messages = ref<SupportChatMessage[]>([])
const resolvedByStaff = ref(false)
const hasUnreadStaff = ref(false)

/// Formulario inicial (visitante sin sesión activa)
const form = reactive({
  name: '',
  phone: '',
  message: '',
})
const formErrors = reactive({
  name: '',
  phone: '',
  message: '',
})
const starting = ref(false)
const startError = ref('')

/// Chat activo
const draft = ref('')
const sending = ref(false)
const sendError = ref('')
const messagesEl = ref<HTMLElement | null>(null)

let pollTimer: ReturnType<typeof setTimeout> | null = null
let lastStaffCount = 0

function saveSession(s: StoredSession | null) {
  session.value = s
  if (!import.meta.client) return
  try {
    if (s) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* storage bloqueado */
  }
}

function loadSession(): StoredSession | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (parsed.conversationId && parsed.visitorToken && parsed.name) {
      return {
        conversationId: parsed.conversationId,
        visitorToken: parsed.visitorToken,
        name: parsed.name,
      }
    }
  } catch {
    /* JSON inválido */
  }
  return null
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

function scheduleNextPoll() {
  stopPolling()
  if (!session.value || resolvedByStaff.value || !import.meta.client) return
  if (document.hidden) return
  const delay = open.value ? POLL_OPEN_MS : POLL_MINIMIZED_MS
  pollTimer = setTimeout(() => {
    void fetchMessages()
  }, delay)
}

async function fetchMessages() {
  if (!session.value || resolvedByStaff.value) return
  const res = await api.getSupportMessages(
    session.value.conversationId,
    session.value.visitorToken,
  )

  if (res) {
    if (res.status === 'resolved') {
      resolvedByStaff.value = true
      stopPolling()
      return
    }
    const prevLen = messages.value.length
    const staffCount = res.messages.filter((m) => m.sender === 'staff').length
    if (!open.value && staffCount > lastStaffCount) {
      hasUnreadStaff.value = true
    }
    lastStaffCount = staffCount
    messages.value = res.messages
    if (res.messages.length > prevLen && open.value) {
      scrollToBottom()
    }
  }

  scheduleNextPoll()
}

function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    hasUnreadStaff.value = false
    if (session.value && !resolvedByStaff.value) {
      void fetchMessages()
      scrollToBottom()
    }
  } else {
    scheduleNextPoll()
  }
}

function validateInitialForm(): boolean {
  const name = form.name.trim()
  const phone = form.phone.trim()
  const message = form.message.trim()

  formErrors.name = name.length >= 2 ? '' : 'Ingresa tu nombre'
  formErrors.phone =
    !phone || /^[+()\-.\s\d]{7,20}$/.test(phone)
      ? ''
      : 'Teléfono inválido'
  formErrors.message = message.length >= 1 ? '' : 'Escribe tu consulta'

  return !formErrors.name && !formErrors.phone && !formErrors.message
}

async function handleStartChat() {
  if (!validateInitialForm() || starting.value) return
  startError.value = ''
  starting.value = true

  try {
    const res = await api.startSupportChat({
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      message: form.message.trim(),
    })

    if ('error' in res) {
      startError.value = res.error
      return
    }

    resolvedByStaff.value = false
    lastStaffCount = 0
    saveSession({
      conversationId: res.conversationId,
      visitorToken: res.visitorToken,
      name: form.name.trim(),
    })
    messages.value = [res.message]
    form.message = ''
    scrollToBottom()
    scheduleNextPoll()
  } finally {
    starting.value = false
  }
}

async function handleSendMessage() {
  const text = draft.value.trim()
  if (!text || !session.value || sending.value || resolvedByStaff.value) return

  sendError.value = ''
  sending.value = true

  try {
    const res = await api.sendSupportMessage(
      session.value.conversationId,
      session.value.visitorToken,
      text,
    )

    if ('error' in res) {
      if (res.closed) {
        resolvedByStaff.value = true
        stopPolling()
      } else {
        sendError.value = res.error
      }
      return
    }

    messages.value = [...messages.value, res]
    draft.value = ''
    scrollToBottom()
  } finally {
    sending.value = false
  }
}

function resetConversation() {
  stopPolling()
  saveSession(null)
  messages.value = []
  resolvedByStaff.value = false
  hasUnreadStaff.value = false
  lastStaffCount = 0
  draft.value = ''
  sendError.value = ''
  startError.value = ''
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function onVisibilityChange() {
  if (!document.hidden && session.value && !resolvedByStaff.value) {
    void fetchMessages()
  } else {
    stopPolling()
  }
}

onMounted(() => {
  const saved = loadSession()
  if (saved) {
    session.value = saved
    form.name = saved.name
    void fetchMessages()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  stopPolling()
  if (import.meta.client) {
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
})
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col items-end">
    <!-- Panel de chat -->
    <Transition name="chat-panel">
      <section v-if="open" aria-label="Chat de ayuda en vivo"
        class="flex h-[32rem] max-h-[calc(100vh-5rem)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-cream-50/15 bg-ink-800 text-cream-50">
        <!-- Cabecera -->
        <header class="flex items-center justify-between border-b border-cream-50/10 bg-ink-900/90 px-5 py-4">
          <div class="flex items-center gap-3">
            <span
              class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-bronze-500/40 bg-bronze-500/15 text-bronze-300">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8 10h8M8 14h5m8-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span
                class="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-900 bg-sage-500" />
            </span>
            <div>
              <h2 class="font-display text-base font-semibold leading-tight text-cream-50">
                Ayuda en vivo
              </h2>
              <p class="text-[11px] text-cream-50/55">
                Recepción · COW-HUB Metepec
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button v-if="session" type="button" title="Iniciar nueva consulta"
              class="rounded-full border border-cream-50/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream-50/70 transition hover:border-bronze-400/60 hover:text-cream-50"
              @click="resetConversation">
              Nuevo
            </button>
            <button type="button" aria-label="Cerrar chat"
              class="grid h-8 w-8 place-items-center rounded-full border border-cream-50/15 text-cream-50/70 transition hover:border-cream-50/40 hover:text-cream-50"
              @click="open = false">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </header>

        <!-- Vista 1: Formulario inicial -->
        <form v-if="!session" class="flex flex-1 flex-col overflow-y-auto p-5" @submit.prevent="handleStartChat">
          <p class="text-[13px] leading-relaxed text-cream-50/70">
            ¿Tienes dudas? Escríbenos y nuestro equipo te responde en directo.
          </p>

          <div class="mt-5 space-y-4">
            <div>
              <label for="support-chat-name"
                class="block text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-50/55">
                Nombre *
              </label>
              <input id="support-chat-name" v-model="form.name" type="text" autocomplete="name" placeholder="Tu nombre"
                maxlength="80"
                class="mt-1.5 w-full rounded-xl border bg-ink-900 px-3.5 py-2.5 text-[13px] text-cream-50 placeholder:text-cream-50/30 transition focus:border-bronze-400"
                :class="formErrors.name ? 'border-terra-500' : 'border-cream-50/15'" />
              <!-- <p v-if="formErrors.name" class="mt-1 text-[11px] text-terra-400">
                {{ formErrors.name }}
              </p> -->
            </div>

            <div>
              <label for="support-chat-phone"
                class="block text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-50/55">
                Teléfono / WhatsApp <span class="normal-case tracking-normal text-cream-50/35">(opcional)</span>
              </label>
              <input id="support-chat-phone" v-model="form.phone" type="tel" autocomplete="tel"
                placeholder="722 000 0000" maxlength="20"
                class="mt-1.5 w-full rounded-xl border bg-ink-900 px-3.5 py-2.5 text-[13px] text-cream-50 placeholder:text-cream-50/30 transition focus:border-bronze-400"
                :class="formErrors.phone ? 'border-terra-500' : 'border-cream-50/15'" />
              <!-- <p v-if="formErrors.phone" class="mt-1 text-[11px] text-terra-400">
                {{ formErrors.phone }}
              </p> -->
            </div>

            <div>
              <label for="support-chat-message"
                class="block text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-50/55">
                ¿En qué te podemos ayudar? *
              </label>
              <textarea id="support-chat-message" v-model="form.message" rows="3" maxlength="1000"
                placeholder="Cuéntanos tu duda o qué espacio buscas..."
                class="mt-1.5 w-full resize-none rounded-xl border bg-ink-900 px-3.5 py-2.5 text-[13px] text-cream-50 placeholder:text-cream-50/30 transition focus:border-bronze-400"
                :class="formErrors.message ? 'border-terra-500' : 'border-cream-50/15'" />
              <!-- <p v-if="formErrors.message" class="mt-1 text-[11px] text-terra-400">
                {{ formErrors.message }}
              </p> -->
              <p v-if="formErrors.message || formErrors.name" class="mt-1 text-[11px] text-terra-400">
                Completa los campos obligatorios.
              </p>
            </div>
          </div>

          <p v-if="startError"
            class="mt-3 rounded-xl border border-terra-500/40 bg-terra-500/10 px-3 py-2 text-[12px] text-terra-400">
            {{ startError }}
          </p>

          <button type="submit" :disabled="starting"
            class="mt-auto w-full rounded-full bg-bronze-500 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-bronze-400 disabled:opacity-50">
            {{ starting ? 'Conectando...' : 'Enviar y chatear' }}
          </button>
        </form>

        <!-- Vista 2: Conversación activa -->
        <template v-else>
          <div ref="messagesEl" class="flex-1 space-y-3 overflow-y-auto p-4">
            <div class="rounded-2xl border border-cream-50/10 bg-ink-900/60 px-3.5 py-2.5 text-[11px] text-cream-50/60">
              Conectado como <strong class="text-cream-50">{{ session.name }}</strong>. Te responderemos aquí mismo en
              cuanto recepción vea tu mensaje.
            </div>

            <div v-for="msg in messages" :key="msg.id" class="flex"
              :class="msg.sender === 'member' ? 'justify-end' : 'justify-start'">
              <div class="max-w-[82%] rounded-2xl px-3.5 py-2.5" :class="msg.sender === 'member'
                ? 'bg-bronze-500 text-ink-900'
                : 'border border-cream-50/10 bg-ink-900 text-cream-50'
                ">
                <p v-if="msg.sender === 'staff'"
                  class="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bronze-300">
                  Recepción
                </p>
                <p class="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                  {{ msg.text }}
                </p>
                <p class="mt-1 text-right text-[10px]"
                  :class="msg.sender === 'member' ? 'text-ink-900/65' : 'text-cream-50/45'">
                  {{ formatTime(msg.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Aviso si staff resolvió la conversación -->
            <div v-if="resolvedByStaff" class="rounded-2xl border border-sage-500/35 bg-sage-500/10 p-4 text-center">
              <p class="text-[12px] font-medium text-cream-50">
                Nuestro equipo marcó esta consulta como resuelta.
              </p>
              <button type="button"
                class="mt-3 rounded-full bg-bronze-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-900 transition hover:bg-bronze-400"
                @click="resetConversation">
                Iniciar nueva consulta
              </button>
            </div>
          </div>

          <p v-if="sendError"
            class="mx-4 mb-2 rounded-xl border border-terra-500/40 bg-terra-500/10 px-3 py-1.5 text-[11px] text-terra-400">
            {{ sendError }}
          </p>

          <!-- Input de seguimiento -->
          <form v-if="!resolvedByStaff" class="flex items-center gap-2 border-t border-cream-50/10 bg-ink-900/80 p-3"
            @submit.prevent="handleSendMessage">
            <input v-model="draft" type="text" maxlength="1000" placeholder="Escribe tu mensaje..."
              class="flex-1 rounded-full border border-cream-50/15 bg-ink-800 px-4 py-2.5 text-[13px] text-cream-50 placeholder:text-cream-50/35 transition focus:border-bronze-400" />
            <button type="submit" aria-label="Enviar mensaje" :disabled="!draft.trim() || sending"
              class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bronze-500 text-ink-900 transition hover:bg-bronze-400 disabled:opacity-45">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </template>
      </section>
    </Transition>

    <!-- Botón flotante (sin sombras por regla UI; oculto durante videos y cuando el panel está abierto) -->
    <Transition name="chat-launcher">
      <button v-if="showLauncher" type="button" aria-label="Abrir chat de ayuda en vivo"
        class="relative flex items-center gap-2.5 rounded-full border border-bronze-400/60 bg-bronze-500 px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-900 transition hover:bg-bronze-400"
        @click="toggleOpen">
        <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
        <span class="hidden sm:inline">Agente en vivo</span>

        <!-- Indicador de respuesta nueva cuando está minimizado -->
        <span v-if="hasUnreadStaff"
          class="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-ink-900 bg-terra-500" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.chat-panel-enter-active,
.chat-panel-leave-active,
.chat-launcher-enter-active,
.chat-launcher-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.chat-panel-enter-from,
.chat-panel-leave-to,
.chat-launcher-enter-from,
.chat-launcher-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
