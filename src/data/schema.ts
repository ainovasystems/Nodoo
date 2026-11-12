// Datos estructurados (schema.org) para buscadores y asistentes de IA.
// El NAP (nombre, dirección, teléfono) sale de site.ts para que coincida
// exactamente con lo que se ve en la web y con las fichas de Google Business.

import { ESPACIOS, FAQS, PLANES, SEDES, SITE, type Espacio, type Sede } from './site';

const abs = (site: URL | string, path: string) => new URL(path, site).toString();

export const orgId = (site: URL | string) => abs(site, '/#organizacion');
export const sedeId = (site: URL | string, sede: Sede) => abs(site, `/${sede.slug}/#sede`);

export function organizationSchema(site: URL | string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId(site),
    name: SITE.name,
    alternateName: 'NODO',
    slogan: SITE.tagline,
    description: SITE.description,
    url: abs(site, '/'),
    logo: abs(site, '/img/logo.png'),
    image: abs(site, '/img/og.jpg'),
    email: SITE.email,
    telephone: SITE.phone,
    sameAs: [SITE.instagram, SITE.linkedin],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: SITE.phone,
      email: SITE.email,
      availableLanguage: ['es', 'gl'],
    },
    location: SEDES.map((s) => ({ '@id': sedeId(site, s) })),
  };
}

export function websiteSchema(site: URL | string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs(site, '/#web'),
    name: SITE.name,
    url: abs(site, '/'),
    inLanguage: 'es-ES',
    publisher: { '@id': orgId(site) },
  };
}

export function sedeSchema(site: URL | string, sede: Sede) {
  const offers =
    sede.id === 'coruna'
      ? PLANES.map((p) => ({
          '@type': 'Offer',
          name: p.name,
          price: p.price,
          priceCurrency: 'EUR',
          description: `${p.features.join('. ')}. Precio mensual sin IVA, sin permanencia y sin matrícula.`,
          url: abs(site, '/#tarifas'),
        }))
      : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    additionalType: 'https://www.wikidata.org/wiki/Q1124538', // coworking
    '@id': sedeId(site, sede),
    name: sede.name,
    description: sede.intro,
    url: abs(site, `/${sede.slug}/`),
    image: abs(site, '/img/og.jpg'),
    logo: abs(site, '/img/logo.png'),
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: '€€',
    parentOrganization: { '@id': orgId(site) },
    address: {
      '@type': 'PostalAddress',
      streetAddress: sede.street,
      addressLocality: sede.locality,
      addressRegion: sede.region,
      addressCountry: 'ES',
    },
    hasMap: sede.mapsUrl,
    areaServed: { '@type': 'City', name: sede.city },
    ...(sede.hours
      ? {
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: sede.hours.opens,
            closes: sede.hours.closes === '00:00' ? '23:59' : sede.hours.closes,
          },
        }
      : {}),
    ...(offers ? { makesOffer: offers } : {}),
    ...(sede.id === 'coruna'
      ? {
          containsPlace: ESPACIOS.map((e) => ({ '@id': abs(site, `/espacios/${e.slug}/#espacio`) })),
          amenityFeature: ['WiFi de alta velocidad', 'Cocina equipada', 'Salas de reuniones', 'Videoconferencia', 'Vistas al mar'].map(
            (name) => ({ '@type': 'LocationFeatureSpecification', name, value: true }),
          ),
        }
      : {}),
  };
}

export function espacioSchema(site: URL | string, e: Espacio) {
  const coruna = SEDES[0];
  const isRoom = e.capacity !== null;
  return {
    '@context': 'https://schema.org',
    '@type': isRoom ? 'MeetingRoom' : 'Place',
    '@id': abs(site, `/espacios/${e.slug}/#espacio`),
    name: `${e.name} · ${SITE.name}`,
    description: e.summary,
    url: abs(site, `/espacios/${e.slug}/`),
    image: e.photos.map((p) => abs(site, `/img/${p.src}-1280.webp`)),
    ...(isRoom ? { maximumAttendeeCapacity: e.capacity } : {}),
    containedInPlace: { '@id': sedeId(site, coruna) },
    address: {
      '@type': 'PostalAddress',
      streetAddress: coruna.street,
      addressLocality: coruna.locality,
      addressRegion: coruna.region,
      addressCountry: 'ES',
    },
    amenityFeature: e.highlights.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
  };
}

export function faqSchema(faqs = FAQS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(site: URL | string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(site, item.path),
    })),
  };
}
