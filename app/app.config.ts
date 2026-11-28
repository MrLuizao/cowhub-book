import type { JourneyMediaSet } from '~/data/journeyMedia'

export default defineAppConfig({
  /// Set de videos del recorrido de entrada: 'office' | 'demo'
  journeyMedia: 'office' as JourneyMediaSet,
  ui: {
    colors: {
      primary: 'bronze',
      neutral: 'stone',
    },
    button: {
      slots: {
        base: 'shadow-none',
      },
    },
    select: {
      slots: {
        content: 'bg-ink-800 ring-1 ring-cream-50/15 shadow-none',
        item: 'text-cream-50 data-highlighted:before:bg-ink-700',
      },
    },
    inputNumber: {
      slots: {
        increment: 'text-bronze-300',
        decrement: 'text-bronze-300',
      },
    },
    popover: {
      slots: {
        content: 'bg-ink-800 ring-1 ring-cream-50/15 shadow-none',
      },
    },
    calendar: {
      slots: {
        root: 'bg-ink-800 text-cream-50',
        headCell: 'text-cream-50/50',
        cellTrigger: 'data-selected:bg-bronze-500 data-selected:text-ink-900 data-today:text-bronze-300',
      },
    },
  },
})
