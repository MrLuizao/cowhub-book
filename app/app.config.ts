import type { JourneyMediaSet } from '~/data/journeyMedia'

export default defineAppConfig({
  /// Set de videos del recorrido de entrada: 'office' | 'demo'
  journeyMedia: 'office' as JourneyMediaSet,
})
