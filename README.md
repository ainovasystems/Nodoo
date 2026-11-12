# NODO Business Club

Web pública de NODO Business Club (coworking en A Coruña y Lugo) y **demo** de la capa de gestión: portal de miembros y panel interno.

- **Web pública**: Astro, HTML estático, sin JavaScript de terceros. Optimizada para SEO local, asistentes de IA (AEO) y fichas de Google Business.
- **Demo de gestión** (`/app/`): React. No tiene servidor: los datos son ficticios y se guardan en el navegador (`localStorage`). Sirve para enseñar cómo funcionaría, no para operar.

## Puesta en marcha

Requiere Node 22 o superior (lo exige Astro).

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run build` genera el sitio en `dist/`. `npm run preview` lo sirve en local.

## Estructura

```
src/
├── data/site.ts        Datos del negocio: sedes, espacios, tarifas, FAQ. Fuente única.
├── data/schema.ts      Datos estructurados (schema.org) generados desde site.ts.
├── styles/tokens.css   Tema: colores de marca, tipografía, espaciado, radios.
├── styles/             Estilos de la web (global.css) y botones compartidos.
├── layouts/            Base.astro (web pública) y AppLayout.astro (demo).
├── components/         Cabecera, pie, tarjetas, tarifas, FAQ, formulario.
├── pages/
│   ├── index.astro             Portada
│   ├── [sede].astro            /coworking-a-coruna/ y /coworking-lugo/
│   ├── espacios/[slug].astro   Una página por espacio
│   ├── legal/[doc].astro       Aviso legal, privacidad y cookies (borradores)
│   └── app/                    Entrada a la demo, portal y panel
└── app/                Demo de gestión (React)
    ├── store.ts        Estado y acciones. En producción, cada acción sería una llamada a la API.
    ├── seed.ts         Datos ficticios de partida.
    ├── ui/             Kit de interfaz compartido por portal y panel.
    ├── portal/         Portal de miembros.
    └── admin/          Panel interno.
public/
├── img/                Fotos optimizadas (WebP, 640/1280/1920 px, sin metadatos EXIF).
├── robots.txt
└── llms.txt            Resumen del negocio para asistentes de IA.
material-original/      Fotos originales, manual de marca, briefing y la web anterior. No se publica.
```

Para cambiar un precio, una dirección o un texto de un espacio, edita `src/data/site.ts`: la web, los datos estructurados y el pie se actualizan a la vez. `public/llms.txt` y `public/robots.txt` se editan a mano.

## Despliegue

Vercel, con la configuración de `vercel.json` (framework Astro, salida en `dist/`). Incluye redirecciones 301 desde las URLs antiguas (`/the-hive.html` → `/espacios/the-hive/`) y cabeceras de seguridad.

El dominio canónico se define en `astro.config.mjs` (`SITE_URL`). Si la web no se publica en `https://nodobc.com`, cámbialo ahí y en `public/robots.txt` y `public/llms.txt`.

## La demo de gestión

| Ruta | Qué enseña |
|---|---|
| `/app/` | Entrada: elige vista |
| `/app/portal/` | Portal de miembros: reservar salas y puestos, mis reservas, suscripción y facturas, consultas, perfil |
| `/app/admin/` | Panel interno: resumen, calendario por sala y sede, reservas, leads (tablero y lista), clientes, consultas, facturación y espacios |

- Las dos vistas comparten estado: una reserva hecha en el portal aparece en el calendario del panel.
- El formulario de contacto de la web deja la solicitud como lead nuevo en el panel.
- «Restablecer demo» devuelve los datos de partida.
- Los espacios y tarifas de Lugo en la demo son **provisionales** (`src/app/seed.ts`), igual que las tarifas por hora de The Office y Atlantic Studio.

Para convertir la demo en producto hace falta: base de datos, API, autenticación con roles, envío de emails y pagos si se quieren. El modelo de datos de `src/app/types.ts` y las acciones de `src/app/store.ts` son el punto de partida.

## SEO, AEO y Google Business

Lo que ya hace la web:

- Una página por sede (`/coworking-a-coruna/`, `/coworking-lugo/`) con nombre, dirección y teléfono idénticos a los del pie y a los datos estructurados.
- Datos estructurados: `Organization`, `WebSite`, `LocalBusiness` por sede (dirección, horario, mapa, ofertas), `MeetingRoom`/`Place` por espacio, `FAQPage` y `BreadcrumbList`.
- Preguntas frecuentes con respuestas directas, pensadas para que un buscador o un asistente pueda citarlas.
- `sitemap-index.xml`, `robots.txt` (permite los rastreadores de IA; excluye `/app/`) y `llms.txt`.
- Título, descripción, canónica y Open Graph en todas las páginas; un único `h1` por página.
- Imágenes en WebP con `srcset`, dimensiones declaradas y carga diferida.

Lo que hay que hacer fuera del código:

1. **Fichas de Google Business**, una por sede. Categoría principal «Espacio de coworking». Nombre, dirección y teléfono escritos exactamente como en `src/data/site.ts`.
2. En cada ficha, enlazar a **su página de sede**, no a la portada: `https://nodobc.com/coworking-a-coruna/` y `https://nodobc.com/coworking-lugo/`.
3. Subir a las fichas las fotos de `public/img/`, añadir horario, servicios (salas de reuniones, WiFi, cocina) y el enlace de reserva.
4. Dar de alta el dominio en Google Search Console y enviar `https://nodobc.com/sitemap-index.xml`.
5. Pedir reseñas a los miembros y responderlas.

## Pendiente de confirmar o completar

- **Textos legales**: `/legal/` son borradores. Faltan titular, NIF, domicilio y revisión jurídica.
- **Formulario de contacto**: sin servidor todavía. Al enviarlo abre un correo ya redactado para `info@nodobc.com`. Conviene conectarlo a un servicio de envío con protección anti-spam.
- **Sede de Lugo**: solo se conoce la dirección. Faltan horario, espacios, tarifas, fotos y código postal.
- **Horario de A Coruña**: se publica 07:00 – 00:00 todos los días; confirmar fines de semana.
- **Códigos postales** de las dos sedes (para los datos estructurados).
- **Tipografía Scanno**: se carga desde cdnfonts.com. Hay que confirmar la licencia y alojarla en el propio sitio.
- **Dominio**: se asume `nodobc.com`.
