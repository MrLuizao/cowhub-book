export type JourneyMediaSet = 'demo' | 'office'

export interface JourneyMediaConfig {
  label: string
  videoBase: string
  posterBase: string
}

export const JOURNEY_MEDIA_SETS: Record<JourneyMediaSet, JourneyMediaConfig> = {
  demo: {
    label: 'Recorrido original (demo)',
    videoBase: '/video',
    posterBase: '/img',
  },
  office: {
    label: 'Business Center moderno',
    videoBase: '/video/office',
    posterBase: '/img/office',
  },
}

export function resolveJourneyMedia(key?: string): JourneyMediaConfig {
  if (key && key in JOURNEY_MEDIA_SETS) {
    return JOURNEY_MEDIA_SETS[key as JourneyMediaSet]
  }
  return JOURNEY_MEDIA_SETS.office
}
