// Datos del negocio. Fuente única para la web pública, los datos
// estructurados (SEO/AEO) y la demo de gestión.

export const SITE = {
  name: 'NODO Business Club',
  shortName: 'NODO',
  tagline: 'Where things start to happen',
  description:
    'Coworking, salas de reuniones y estudio profesional en A Coruña y Lugo. Puestos desde 149 € + IVA al mes, sin permanencia y sin matrícula.',
  email: 'info@nodobc.com',
  phone: '+34 611 724 527',
  phoneHref: '+34611724527',
  instagram: 'https://www.instagram.com/nodo.business/',
  linkedin: 'https://www.linkedin.com/company/nodo-business-club/',
} as const;

export type SedeId = 'coruna' | 'lugo';

export interface Sede {
  id: SedeId;
  slug: string;
  city: string;
  name: string;
  street: string;
  locality: string;
  region: string;
  mapsUrl: string;
  /** Horario publicado. `null` = pendiente de confirmar: no se muestra ni se marca. */
  hours: { opens: string; closes: string; label: string } | null;
  intro: string;
}

export const SEDES: Sede[] = [
  {
    id: 'coruna',
    slug: 'coworking-a-coruna',
    city: 'A Coruña',
    name: 'NODO Business Club A Coruña',
    street: 'Avenida Linares Rivas, 5, 3º',
    locality: 'A Coruña',
    region: 'A Coruña',
    mapsUrl: 'https://maps.app.goo.gl/HskTP73yazNzW4Ru8',
    hours: { opens: '07:00', closes: '00:00', label: '07:00 – 00:00' },
    intro:
      'Frente al puerto, en plena Avenida Linares Rivas. Puestos de trabajo, sala de reuniones, oficina ejecutiva y un estudio con vistas al mar.',
  },
  {
    id: 'lugo',
    slug: 'coworking-lugo',
    city: 'Lugo',
    name: 'NODO Business Club Lugo',
    street: 'Estrada da Granxa, 2, entreplanta',
    locality: 'Lugo',
    region: 'Lugo',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Estrada+da+Granxa+2+Lugo',
    hours: null,
    intro:
      'La segunda sede de NODO, en Estrada da Granxa. El mismo modo de trabajar, ahora también en Lugo.',
  },
];

export const sedeById = (id: SedeId) => SEDES.find((s) => s.id === id)!;

export interface Photo {
  /** Nombre base en /public/img (sin sufijo de ancho ni extensión). */
  src: string;
  alt: string;
  w: number;
  h: number;
}

export interface Espacio {
  slug: string;
  name: string;
  kind: string;
  summary: string;
  lead: string;
  capacity: number | null;
  hours: string | null;
  highlights: string[];
  details: { title: string; text: string }[];
  photos: Photo[];
  priceFrom: string | null;
}

export const ESPACIOS: Espacio[] = [
  {
    slug: 'the-hive',
    name: 'The Hive',
    kind: 'Coworking',
    summary: 'Tu puesto de trabajo diario, con cajonera personal y una comunidad profesional alrededor.',
    lead: 'La sala de coworking de NODO: puestos asignados, mobiliario ergonómico y el ritmo de trabajo de quien viene a avanzar.',
    capacity: null,
    hours: null,
    highlights: [
      'Puesto personal asignado',
      'Silla ergonómica y cajonera personal',
      'WiFi de alta velocidad',
      'Acceso a las zonas comunes',
    ],
    details: [
      {
        title: 'Puestos de trabajo',
        text: 'Mesa propia, cajonera personal y silla ergonómica de alta calidad. Llegas, te sientas y trabajas.',
      },
      {
        title: 'Zonas de colaboración',
        text: 'Mesas pensadas tanto para profesionales independientes como para equipos pequeños.',
      },
      { title: 'Conectividad', text: 'Conexión WiFi de alta velocidad en toda la sala.' },
      {
        title: 'Comunidad profesional',
        text: 'Un entorno de networking empresarial, productivo y dinámico, donde surgen colaboraciones entre marcas y profesionales.',
      },
    ],
    photos: [
      { src: 'hive-1', alt: 'Sala de coworking The Hive con mesas de madera, sillas ergonómicas y cajoneras', w: 6000, h: 4000 },
      { src: 'hive-2', alt: 'Puestos de trabajo de The Hive junto a plantas naturales y lámparas de pie', w: 6000, h: 4000 },
      { src: 'hive-3', alt: 'Vista de The Hive con luz natural entrando por los ventanales', w: 2974, h: 3717 },
      { src: 'hive-4', alt: 'Mesas de trabajo individuales en The Hive', w: 3200, h: 4000 },
    ],
    priceFrom: 'Desde 149 € + IVA/mes',
  },
  {
    slug: 'chatroom',
    name: 'Chatroom',
    kind: 'Sala de reuniones',
    summary: 'Sala de reuniones para 10 personas con videoconferencia, pantalla y pizarra.',
    lead: 'Una sala corporativa para reunirte con clientes o con tu equipo, disponible con reserva previa por horas o mediante pack mensual.',
    capacity: 10,
    hours: null,
    highlights: [
      'Hasta 10 participantes',
      'Videoconferencia HD',
      'Pantalla de TV con HDMI',
      'Pizarra y rotuladores',
    ],
    details: [
      { title: 'Capacidad', text: 'Hasta 10 participantes alrededor de una mesa de reunión.' },
      {
        title: 'Tecnología',
        text: 'Sistema audiovisual con pantalla, cámara, micrófono y conexión HDMI para videoconferencias.',
      },
      { title: 'Mobiliario', text: 'Mesa de reunión y sillas ergonómicas de alta calidad.' },
      {
        title: 'Modalidad de uso',
        text: 'Disponible mediante pack mensual para miembros o alquiler por horas para externos, siempre con reserva previa.',
      },
    ],
    photos: [
      { src: 'chatroom-1', alt: 'Sala de reuniones Chatroom con mesa para diez personas y pantalla de videoconferencia', w: 3854, h: 2890 },
      { src: 'chatroom-2', alt: 'Mesa de reuniones del Chatroom con pantalla de TV en la pared', w: 5356, h: 3571 },
    ],
    priceFrom: 'Desde 20 €/h + IVA',
  },
  {
    slug: 'the-office',
    name: 'The Office',
    kind: 'Sala ejecutiva',
    summary: 'Sala ejecutiva para 8 personas con vistas panorámicas al mar y aseo propio.',
    lead: 'La sala para las reuniones que importan: vistas al puerto, aseo integrado y todo el equipamiento para presentar y decidir.',
    capacity: 8,
    hours: null,
    highlights: [
      'Hasta 8 participantes',
      'Vistas panorámicas al mar',
      'Aseo integrado en la sala',
      'Videoconferencia HD y pantalla de TV',
      'Pizarra magnética',
      'WiFi dedicado',
    ],
    details: [
      { title: 'Instalaciones', text: 'Aseo integrado en la propia sala.' },
      { title: 'Mobiliario', text: 'Mesa de reunión con capacidad para hasta 8 personas.' },
      {
        title: 'Tecnología',
        text: 'Sistema de videoconferencia con pantalla, cámara, micrófono y conexión HDMI. Pizarra magnética y material de escritura.',
      },
    ],
    photos: [
      { src: 'office-1', alt: 'The Office: sala ejecutiva con ventanales y vistas al puerto de A Coruña', w: 4032, h: 3024 },
      { src: 'office-2', alt: 'Vistas al mar y al puerto desde los ventanales de The Office', w: 5366, h: 3577 },
    ],
    priceFrom: '2.475 € + IVA/mes',
  },
  {
    slug: 'atlantic-studio',
    name: 'Atlantic Studio',
    kind: 'Sala y estudio',
    summary: 'Sala polivalente y estudio fotográfico para 12 personas, con luz natural y vistas al mar.',
    lead: 'Un espacio que cambia contigo: sala de reuniones por la mañana, estudio de fotografía por la tarde. Con luz natural todo el día.',
    capacity: 12,
    hours: '07:00 – 21:00',
    highlights: [
      'Hasta 12 participantes',
      'Fondo fotográfico de 170 cm',
      'Cambiador y burro para ropa',
      'Videoconferencia HD y pantalla de TV',
      'Pizarra magnética',
      'Luz natural y vistas al mar',
    ],
    details: [
      {
        title: 'Equipamiento profesional',
        text: 'Fondo fotográfico blanco de papel (170 cm), vestuario individual, sistema para colgar prendas y zona de apoyo para equipos informáticos y material técnico.',
      },
      {
        title: 'Iluminación',
        text: 'Luz natural a través de los ventanales, complementada con iluminación artificial.',
      },
      { title: 'Mobiliario', text: 'Mesa de reunión con capacidad para 10-12 personas.' },
      {
        title: 'Tecnología',
        text: 'Pantalla interactiva con cámara y micrófono integrados, videoconferencia con conexión HDMI y WiFi dedicado de alta velocidad.',
      },
      {
        title: 'Herramientas de trabajo',
        text: 'Pizarra magnética y material de escritura para sesiones de trabajo y lluvia de ideas.',
      },
      { title: 'Horario de acceso', text: 'Disponible de 07:00 a 21:00.' },
    ],
    photos: [
      { src: 'atlantic-1', alt: 'Atlantic Studio con mesa de reuniones para doce personas y ventanales al mar', w: 6000, h: 4000 },
      { src: 'atlantic-2', alt: 'Ventanales de madera de Atlantic Studio con luz natural', w: 6000, h: 4000 },
      { src: 'atlantic-3', alt: 'Vistas al puerto de A Coruña desde Atlantic Studio', w: 5715, h: 3810 },
    ],
    priceFrom: 'Desde 190 € + IVA',
  },
  {
    slug: 'espacios-comunes',
    name: 'Espacios comunes',
    kind: 'Hall, zona de estar y cocina-bar',
    summary: 'Sofás, cocina equipada y zona de estar para las pausas, el café y las conversaciones que no caben en una sala.',
    lead: 'Incluidos en todos los planes. El lugar donde se hace una llamada rápida, se toma un café o se conoce a quien trabaja en la mesa de al lado.',
    capacity: null,
    hours: null,
    highlights: [
      'Sofás y mesas para pausas',
      'Cocina equipada: microondas, hervidor, nevera y cafetera',
      'Vajilla y cubiertos',
      'Acceso a 2 aseos',
    ],
    details: [
      {
        title: 'Hall y zona de estar',
        text: 'Sofás y mesa para pausas, café, llamadas informales, charlas relajadas y desconexión.',
      },
      {
        title: 'Cocina-bar',
        text: 'Cocina equipada con microondas, hervidor, nevera, cafetera, vajilla y cubiertos.',
      },
      { title: 'Aseos', text: 'Acceso a 2 aseos.' },
    ],
    photos: [
      { src: 'comunes-1', alt: 'Zona de estar de NODO con mesa alta y taburetes sobre una alfombra', w: 2880, h: 3841 },
    ],
    priceFrom: 'Incluido en todos los planes',
  },
];

export interface Tarifa {
  name: string;
  price: string;
  unit: string;
  note?: string;
}

export const PLANES = [
  {
    id: 'hive-basic',
    name: 'The Hive Basic',
    price: 149,
    unit: '+ IVA/mes',
    features: [
      'Escritorio estándar asignado al llegar',
      'WiFi de alta velocidad',
      'Cajonera personal',
      'Acceso a zonas comunes',
    ],
    featured: false,
  },
  {
    id: 'hive-plus',
    name: 'The Hive Plus',
    price: 199,
    unit: '+ IVA/mes',
    features: [
      'Escritorio a elegir según disponibilidad',
      'WiFi de alta velocidad',
      'Cajonera personal',
      'Acceso a zonas comunes',
    ],
    featured: true,
  },
] as const;

export const TARIFAS_SALAS: { space: string; slug: string; groups: { title: string; rows: Tarifa[] }[]; note?: string }[] = [
  {
    space: 'Chatroom',
    slug: 'chatroom',
    groups: [
      {
        title: 'Miembros (Hivers)',
        rows: [
          { name: 'Pack 4 horas al mes', price: '50 €', unit: '+ IVA' },
          { name: 'Pack 10 horas al mes', price: '100 €', unit: '+ IVA' },
        ],
      },
      { title: 'Externos', rows: [{ name: 'Por hora', price: '20 €/h', unit: '+ IVA' }] },
    ],
  },
  {
    space: 'Atlantic Studio',
    slug: 'atlantic-studio',
    groups: [
      {
        title: 'Alquiler por jornada',
        rows: [
          { name: 'Medio día (mañana o tarde)', price: '190 €', unit: '+ IVA' },
          { name: 'Día completo', price: '320 €', unit: '+ IVA' },
        ],
      },
      {
        title: 'Miembros (Hivers)',
        rows: [
          { name: 'Pack 4 horas al mes', price: '160 €/mes', unit: '+ IVA' },
          { name: 'Pack 10 horas al mes', price: '300 €/mes', unit: '+ IVA' },
        ],
      },
    ],
    note: 'Horario del estudio: 07:00 – 21:00.',
  },
  {
    space: 'The Office',
    slug: 'the-office',
    groups: [
      {
        title: 'Alquiler mensual',
        rows: [{ name: 'Oficina con vistas al mar', price: '2.475 €', unit: '+ IVA/mes' }],
      },
    ],
  },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Qué es NODO Business Club?',
    a: 'NODO Business Club es un espacio de coworking con sedes en A Coruña y Lugo. Ofrece puestos de trabajo mensuales, salas de reuniones por horas, una oficina ejecutiva y un estudio polivalente, pensado para profesionales independientes, teletrabajadores y empresas.',
  },
  {
    q: '¿Dónde están las sedes de NODO?',
    a: 'NODO tiene dos sedes en Galicia: en A Coruña, en Avenida Linares Rivas, 5, 3º, frente al puerto; y en Lugo, en Estrada da Granxa, 2, entreplanta.',
  },
  {
    q: '¿Cuánto cuesta un puesto de coworking en NODO?',
    a: 'El plan The Hive Basic cuesta 149 € + IVA al mes e incluye escritorio estándar, WiFi de alta velocidad, cajonera personal y acceso a las zonas comunes. El plan The Hive Plus cuesta 199 € + IVA al mes y permite elegir escritorio según disponibilidad.',
  },
  {
    q: '¿Hay permanencia o matrícula?',
    a: 'No. Los planes de coworking de NODO no tienen permanencia ni matrícula.',
  },
  {
    q: '¿Puedo alquilar una sala de reuniones sin ser miembro?',
    a: 'Sí. La sala Chatroom, con capacidad para 10 personas, videoconferencia HD, pantalla y pizarra, se alquila a externos por 20 € + IVA la hora. Los miembros disponen de packs mensuales de 4 horas (50 € + IVA) y 10 horas (100 € + IVA).',
  },
  {
    q: '¿Qué horario tiene NODO?',
    a: 'La sede de A Coruña abre de 07:00 a 00:00. Atlantic Studio está disponible de 07:00 a 21:00.',
  },
  {
    q: '¿Se puede alquilar un espacio para sesiones de fotos o eventos?',
    a: 'Sí. Atlantic Studio es una sala polivalente para hasta 12 personas con fondo fotográfico de 170 cm, cambiador, burro para ropa, luz natural y vistas al mar. Se alquila por medio día (190 € + IVA) o día completo (320 € + IVA).',
  },
  {
    q: '¿Qué incluyen las zonas comunes?',
    a: 'Hall y zona de estar con sofás, cocina-bar equipada con microondas, hervidor, nevera, cafetera, vajilla y cubiertos, y acceso a 2 aseos. Están incluidas en todos los planes.',
  },
  {
    q: '¿Cómo reservo una sala o una visita?',
    a: 'Puedes escribir a info@nodobc.com, llamar al +34 611 724 527 o enviar el formulario de contacto de la web indicando la sede y el espacio que te interesa.',
  },
];

/** Devuelve las URLs de una foto en sus anchos generados. */
export function photoSrcset(p: Photo): string {
  return [640, 1280, 1920]
    .filter((w) => w <= p.w)
    .map((w) => `/img/${p.src}-${w}.webp ${w}w`)
    .join(', ');
}
