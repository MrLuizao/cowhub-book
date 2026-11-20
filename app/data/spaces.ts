export interface CoworkSpace {
  id: string
  name: string
  tagline: string
  description: string
  capacity: number
  pricePerHour: number
  pricePerDay?: number
  image: string
  gallery: string[]
  amenities: string[]
  category: 'sala-juntas' | 'evento' | 'escritorio' | 'focus'
  featured?: boolean
}

export const spaces: CoworkSpace[] = [
  {
    id: 'andamio',
    name: 'Sala Andamio',
    tagline: 'Juntas ejecutivas para 12',
    description:
      'Nuestra sala insignia: mesa de trabajo en madera, pantalla 4K, videoconferencia integral y servicio de café de barra. Pensada para decisiones que mueven el negocio.',
    capacity: 12,
    pricePerHour: 350,
    pricePerDay: 2400,
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80',
    ],
    amenities: ['Pantalla 4K', 'Videoconferencia', 'Café de barra', 'Blinds motorizados'],
    category: 'sala-juntas',
    featured: true,
  },
  {
    id: 'proyector',
    name: 'Sala Proyector',
    tagline: 'Demos y presentaciones para 16',
    description:
      'Formato auditorium reducido con proyector láser, iluminación de escena y control de sonido. Ideal para demos de producto, pitch days y capacitaciones.',
    capacity: 16,
    pricePerHour: 300,
    pricePerDay: 2000,
    image:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
    ],
    amenities: ['Proyector 4K', 'Sonido integrado', 'Iluminación de escena', 'Streaming'],
    category: 'sala-juntas',
  },
  {
    id: 'auditorio',
    name: 'Auditorio Metepec',
    tagline: 'Eventos y lanzamientos para 60',
    description:
      'El espacio más grande del centro: butacas numeradas, escenario con iluminación profesional y backstage. Perfecto para conferencias, lanzamientos y galas.',
    capacity: 60,
    pricePerHour: 800,
    pricePerDay: 6000,
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
    ],
    amenities: ['Escenario', 'Iluminación LED', 'Sonido PA', 'Backstage', 'Streaming'],
    category: 'evento',
    featured: true,
  },
  {
    id: 'terraza',
    name: 'Terraza Sur',
    tagline: 'Networking al aire libre',
    description:
      'Espacio exterior con café de grano, sombreadero retráctil y vista al boulevard. El escenario perfecto para after offices y reuniones informales.',
    capacity: 40,
    pricePerHour: 250,
    pricePerDay: 1500,
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    ],
    amenities: ['Exterior', 'Sombrilla retráctil', 'Café de grano', 'WiFi exterior'],
    category: 'evento',
  },
  {
    id: 'cabina-focus',
    name: 'Cabinas Focus',
    tagline: 'Concentración profunda para 1–4',
    description:
      'Módulos acústicos de trabajo profundo con luz circadiana, monitor externo y aislamiento de ruido. Reservables por bloques de 2 horas.',
    capacity: 4,
    pricePerHour: 120,
    pricePerDay: 700,
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80',
    ],
    amenities: ['Aislamiento acústico', 'Luz circadiana', 'Monitor externo', 'Ergonomía'],
    category: 'focus',
  },
  {
    id: 'hotdesk',
    name: 'Hot Desk Flexible',
    tagline: 'Escritorio por día en planta abierta',
    description:
      'Acceso a la planta de coworking con escritorios ergonómicos, lockers, café ilimitado y comunidad. El plan más flexible para profesionales independientes.',
    capacity: 30,
    pricePerHour: 80,
    pricePerDay: 350,
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    ],
    amenities: ['WiFi premium', 'Café ilimitado', 'Lockers', 'Comunidad'],
    category: 'escritorio',
    featured: true,
  },
]

export const categoryLabels: Record<CoworkSpace['category'], string> = {
  'sala-juntas': 'Salas de juntas',
  'evento': 'Eventos',
  'escritorio': 'Escritorios',
  'focus': 'Concentración',
}
