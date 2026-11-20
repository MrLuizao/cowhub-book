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

/// Cliente de la API pública del B2B. Devuelve null en caso de error
/// para que las páginas caigan al modo demo (datos locales).
export function usePublicApi() {
  const config = useRuntimeConfig()
  const base = (config.public.apiBase as string) || ''

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

  return { listSpaces, spaceDetail, createBooking, createTour }
}
