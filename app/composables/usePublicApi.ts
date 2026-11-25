import type { CoworkSpace } from '~/data/spaces'

interface BookedSlot {
  mode: string
  startHour: number | null
  endHour: number | null
}

interface SpaceDetailResponse {
  space: CoworkSpace & { pricePerDay: number | null }
  hours: { open: number; close: number }
  booked: BookedSlot[]
}

interface BookingResponse {
  booking: {
    folio: string
    totalMxn: number
    date: string
    mode: string
    startHour: number | null
    endHour: number | null
  }
}

interface TourResponse {
  tour: { folio: string }
}

export interface SupportChatMessage {
  id: string
  conversationId: string
  sender: 'member' | 'staff' | 'ai'
  senderName: string
  text: string
  createdAt: number
  read: boolean
}

export interface StartSupportChatResponse {
  conversationId: string
  visitorToken: string
  message: SupportChatMessage
}

export interface SupportMessagesResponse {
  status: 'open' | 'resolved'
  messages: SupportChatMessage[]
}

/// Cliente de la API pública del B2B. Devuelve null en caso de error
/// para que las páginas caigan al modo demo (datos locales).
export function usePublicApi() {
  const config = useRuntimeConfig()
  const base = ((config.public.apiBase as string) || '').replace(/\/+$/, '')

  async function listSpaces(): Promise<CoworkSpace[] | null> {
    try {
      return await $fetch<CoworkSpace[]>(`${base}/api/public/spaces`)
    } catch {
      return null
    }
  }

  async function spaceDetail(
    id: string,
    date: string,
  ): Promise<SpaceDetailResponse | null> {
    try {
      return await $fetch<SpaceDetailResponse>(
        `${base}/api/public/spaces/${id}?date=${date}`,
      )
    } catch {
      return null
    }
  }

  async function createBooking(payload: Record<string, unknown>) {
    try {
      return await $fetch<BookingResponse>(`${base}/api/public/bookings`, {
        method: 'POST',
        body: payload,
      })
    } catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
      return { error: err?.data?.statusMessage ?? err?.statusMessage ?? 'Error al reservar' }
    }
  }

  async function createTour(payload: Record<string, unknown>) {
    try {
      return await $fetch<TourResponse>(`${base}/api/public/tours`, {
        method: 'POST',
        body: payload,
      })
    } catch {
      return null
    }
  }

  async function startSupportChat(payload: {
    name: string
    phone?: string
    message: string
  }): Promise<StartSupportChatResponse | { error: string }> {
    try {
      return await $fetch<StartSupportChatResponse>(`${base}/api/public/support/conversations`, {
        method: 'POST',
        body: payload,
      })
    } catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
      return {
        error: err?.data?.statusMessage ?? err?.statusMessage ?? 'No se pudo conectar con recepción',
      }
    }
  }

  async function getSupportMessages(
    conversationId: string,
    token: string,
  ): Promise<SupportMessagesResponse | null> {
    try {
      return await $fetch<SupportMessagesResponse>(
        `${base}/api/public/support/${encodeURIComponent(conversationId)}/messages`,
        {
          headers: { 'X-Visitor-Token': token },
        },
      )
    } catch {
      return null
    }
  }

  async function sendSupportMessage(
    conversationId: string,
    token: string,
    text: string,
  ): Promise<SupportChatMessage | { error: string; closed?: boolean }> {
    try {
      return await $fetch<SupportChatMessage>(
        `${base}/api/public/support/${encodeURIComponent(conversationId)}/messages`,
        {
          method: 'POST',
          headers: { 'X-Visitor-Token': token },
          body: { text },
        },
      )
    } catch (e: unknown) {
      const err = e as { statusCode?: number; data?: { statusMessage?: string }; statusMessage?: string }
      return {
        error: err?.data?.statusMessage ?? err?.statusMessage ?? 'No se pudo enviar tu mensaje',
        closed: err?.statusCode === 410 || err?.statusCode === 404,
      }
    }
  }

  return {
    listSpaces,
    spaceDetail,
    createBooking,
    createTour,
    startSupportChat,
    getSupportMessages,
    sendSupportMessage,
  }
}
