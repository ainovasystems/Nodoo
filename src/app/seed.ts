// Datos de demostración. Todo lo que hay aquí es ficticio: personas,
// empresas, reservas e importes. Las fechas se generan en torno a hoy
// para que la demo siempre parezca viva.

import type { Booking, DemoState, Invoice, Lead, Member, Plan, Space, Ticket } from './types';
import { addDays, toISODate } from './dates';

export const STATE_VERSION = 3;

const H = (h: number) => h * 60;

export const SPACES: Space[] = [
  // A Coruña — espacios reales de la sede. Tarifas por hora orientativas para la demo.
  { id: 'cor-chatroom', sedeId: 'coruna', name: 'Chatroom', kind: 'sala', capacity: 10, units: 1, open: H(7), close: H(24), mode: 'horas', rateExternal: 20, rateMember: 12.5 },
  { id: 'cor-office', sedeId: 'coruna', name: 'The Office', kind: 'sala', capacity: 8, units: 1, open: H(7), close: H(24), mode: 'horas', rateExternal: 60, rateMember: 40 },
  { id: 'cor-atlantic', sedeId: 'coruna', name: 'Atlantic Studio', kind: 'estudio', capacity: 12, units: 1, open: H(7), close: H(21), mode: 'horas', rateExternal: 48, rateMember: 40 },
  { id: 'cor-hive', sedeId: 'coruna', name: 'The Hive · puesto flexible', kind: 'puestos', capacity: 1, units: 6, open: H(7), close: H(24), mode: 'jornada', rateExternal: 0, rateMember: 0 },
  // Lugo — nombres y tarifas provisionales hasta definir los espacios de la sede.
  { id: 'lug-sala', sedeId: 'lugo', name: 'Sala de reuniones', kind: 'sala', capacity: 8, units: 1, open: H(8), close: H(21), mode: 'horas', rateExternal: 20, rateMember: 12.5 },
  { id: 'lug-despacho', sedeId: 'lugo', name: 'Despacho', kind: 'sala', capacity: 4, units: 1, open: H(8), close: H(21), mode: 'horas', rateExternal: 30, rateMember: 20 },
  { id: 'lug-puestos', sedeId: 'lugo', name: 'Puesto flexible', kind: 'puestos', capacity: 1, units: 8, open: H(8), close: H(21), mode: 'jornada', rateExternal: 0, rateMember: 0 },
];

export const PLANS: Plan[] = [
  { id: 'hive-basic', name: 'The Hive Basic', price: 149, description: 'Escritorio estándar, WiFi, cajonera personal y zonas comunes.' },
  { id: 'hive-plus', name: 'The Hive Plus', price: 199, description: 'Escritorio a elegir, WiFi, cajonera personal y zonas comunes.' },
  { id: 'office', name: 'The Office mensual', price: 2475, description: 'Oficina privada con vistas al mar, aseo propio y videoconferencia.' },
];

const MEMBERS: Member[] = [
  { id: 'm-lucia', name: 'Lucía Varela', email: 'lucia@varelaestudio.example', phone: '600 100 201', company: 'Varela Estudio', sedeId: 'coruna', planId: 'hive-plus', status: 'activo', since: '2026-05-04' },
  { id: 'm-brais', name: 'Brais Castro', email: 'brais@castrodev.example', phone: '600 100 202', company: 'Castro Dev', sedeId: 'coruna', planId: 'hive-basic', status: 'activo', since: '2026-05-11' },
  { id: 'm-noa', name: 'Noa Pardo', email: 'noa@atlanticalegal.example', phone: '600 100 203', company: 'Atlántica Legal', sedeId: 'coruna', planId: 'office', status: 'activo', since: '2026-06-01' },
  { id: 'm-iago', name: 'Iago Souto', email: 'iago@soutofoto.example', phone: '600 100 204', company: 'Souto Fotografía', sedeId: 'coruna', planId: 'hive-plus', status: 'activo', since: '2026-06-15' },
  { id: 'm-antia', name: 'Antía Rey', email: 'antia@reyconsulting.example', phone: '600 100 205', company: 'Rey Consulting', sedeId: 'coruna', planId: 'hive-basic', status: 'activo', since: '2026-07-01' },
  { id: 'm-xoel', name: 'Xoel Mariño', email: 'xoel@marinodata.example', phone: '600 100 206', company: 'Mariño Data', sedeId: 'coruna', planId: 'hive-plus', status: 'pausado', since: '2026-05-20' },
  { id: 'm-sabela', name: 'Sabela Vidal', email: 'sabela@vidalmkt.example', phone: '600 100 207', company: 'Vidal Marketing', sedeId: 'coruna', planId: 'hive-basic', status: 'activo', since: '2026-09-08' },
  { id: 'm-martin', name: 'Martín Lago', email: 'martin@lagoarq.example', phone: '600 100 208', company: 'Lago Arquitectura', sedeId: 'coruna', planId: null, status: 'activo', since: '2026-09-22' },
  { id: 'm-uxia', name: 'Uxía Ferreiro', email: 'uxia@ferreiroux.example', phone: '600 100 209', company: 'Ferreiro UX', sedeId: 'lugo', planId: 'hive-plus', status: 'activo', since: '2026-09-01' },
  { id: 'm-anxo', name: 'Anxo Carballo', email: 'anxo@carballoweb.example', phone: '600 100 210', company: 'Carballo Web', sedeId: 'lugo', planId: 'hive-basic', status: 'activo', since: '2026-09-15' },
  { id: 'm-carme', name: 'Carme Neira', email: 'carme@neiratrad.example', phone: '600 100 211', company: 'Neira Traducións', sedeId: 'lugo', planId: 'hive-basic', status: 'activo', since: '2026-10-01' },
  { id: 'm-roi', name: 'Roi Seoane', email: 'roi@seoaneing.example', phone: '600 100 212', company: 'Seoane Enxeñaría', sedeId: 'lugo', planId: 'hive-plus', status: 'activo', since: '2026-10-13' },
  { id: 'm-ines', name: 'Inés Piñeiro', email: 'ines@pineirorrhh.example', phone: '600 100 213', company: 'Piñeiro RRHH', sedeId: 'lugo', planId: null, status: 'activo', since: '2026-10-20' },
  { id: 'm-dani', name: 'Dani Outeiro', email: 'dani@outeirofilms.example', phone: '600 100 214', company: 'Outeiro Films', sedeId: 'coruna', planId: 'hive-basic', status: 'baja', since: '2026-05-06' },
];

const GUESTS = ['Galaica Seguros', 'Estudio Mera', 'Clínica Riazor', 'Ártabra Tech', 'Lucus Formación', 'Miño Eventos', 'Torre Asesores'];

/** Generador pseudoaleatorio con semilla fija: la demo es igual para todos. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBookings(today: Date): Booking[] {
  const rand = mulberry32(20260401);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const out: Booking[] = [];
  let n = 1;
  const push = (b: Omit<Booking, 'id' | 'createdAt'>, createdDaysBefore = 3) => {
    out.push({
      ...b,
      id: `b-${String(n++).padStart(4, '0')}`,
      createdAt: addDays(new Date(b.date + 'T10:00:00'), -createdDaysBefore).toISOString(),
    });
  };

  for (let offset = -12; offset <= 16; offset++) {
    const day = addDays(today, offset);
    const date = toISODate(day);
    const weekday = day.getDay(); // 0 domingo
    if (weekday === 0) continue;
    const quiet = weekday === 6;

    for (const space of SPACES) {
      const members = MEMBERS.filter((m) => m.sedeId === space.sedeId && m.status === 'activo');
      if (space.mode === 'jornada') {
        const count = quiet ? Math.floor(rand() * 2) : 1 + Math.floor(rand() * (space.units - 2));
        const shuffled = [...members].sort(() => rand() - 0.5).slice(0, count);
        for (const m of shuffled) {
          push({ spaceId: space.id, sedeId: space.sedeId, memberId: m.id, date, start: space.open, end: space.close, status: 'confirmada', source: 'portal', price: 0 }, 1);
        }
        continue;
      }
      const slots = quiet ? (rand() < 0.4 ? 1 : 0) : Math.floor(rand() * 3.4);
      let cursor = space.open + 60 * (1 + Math.floor(rand() * 3));
      for (let i = 0; i < slots; i++) {
        const duration = 60 * (1 + Math.floor(rand() * 3));
        const start = cursor;
        const end = start + duration;
        if (end > Math.min(space.close, H(21))) break;
        const isGuest = rand() < 0.35;
        const member = isGuest ? null : pick(members);
        const hours = duration / 60;
        const future = offset >= 0;
        push({
          spaceId: space.id,
          sedeId: space.sedeId,
          memberId: member ? member.id : null,
          guestName: member ? undefined : pick(GUESTS),
          date,
          start,
          end,
          status: future && rand() < 0.18 ? 'pendiente' : !future && rand() < 0.06 ? 'cancelada' : 'confirmada',
          source: isGuest ? (rand() < 0.5 ? 'web' : 'panel') : 'portal',
          price: Math.round(hours * (member ? space.rateMember : space.rateExternal) * 100) / 100,
        });
        cursor = end + 60 * (1 + Math.floor(rand() * 2));
      }
    }
  }
  return out;
}

function buildLeads(today: Date): Lead[] {
  const iso = (d: number, h = 10) => {
    const x = addDays(today, d);
    x.setHours(h, 15, 0, 0);
    return x.toISOString();
  };
  const day = (d: number) => toISODate(addDays(today, d));
  return [
    { id: 'l-01', name: 'Paula Regueiro', email: 'paula@regueirodesign.example', phone: '600 200 301', company: 'Regueiro Design', sedeId: 'coruna', interest: 'Puesto The Hive Plus', source: 'Web', stage: 'nuevo', value: 199, owner: 'Sin asignar', createdAt: iso(0, 9), nextAction: null, notes: [], message: 'Hola, soy diseñadora freelance y busco un puesto fijo cerca del centro. ¿Puedo pasar a verlo esta semana?' },
    { id: 'l-02', name: 'Óscar Vilar', email: 'oscar@vilarabogados.example', phone: '600 200 302', company: 'Vilar Abogados', sedeId: 'coruna', interest: 'The Office mensual', source: 'Google', stage: 'nuevo', value: 2475, owner: 'Sin asignar', createdAt: iso(-1, 17), nextAction: null, notes: [], message: 'Necesitamos un despacho para tres personas con sala para recibir clientes.' },
    { id: 'l-03', name: 'Nerea Fraga', email: 'nerea@fragacoach.example', phone: '600 200 303', company: 'Fraga Coaching', sedeId: 'lugo', interest: 'Sala de reuniones por horas', source: 'Instagram', stage: 'nuevo', value: 80, owner: 'Sin asignar', createdAt: iso(-1, 12), nextAction: null, notes: [] },
    { id: 'l-04', name: 'Hugo Barreiro', email: 'hugo@barreiroapps.example', phone: '600 200 304', company: 'Barreiro Apps', sedeId: 'coruna', interest: '3 puestos The Hive', source: 'LinkedIn', stage: 'contactado', value: 597, owner: 'Sergio', createdAt: iso(-4), nextAction: { date: day(0), text: 'Llamar para cerrar fecha de visita' }, notes: [{ at: iso(-3, 11), author: 'Sergio', text: 'Equipo de 3 desarrolladores. Les encaja Plus. Quieren ver la sala antes de decidir.' }] },
    { id: 'l-05', name: 'Lara Montero', email: 'lara@monterofoto.example', phone: '600 200 305', company: 'Montero Foto', sedeId: 'coruna', interest: 'Atlantic Studio, sesiones mensuales', source: 'Instagram', stage: 'contactado', value: 300, owner: 'Marta', createdAt: iso(-6), nextAction: { date: day(-1), text: 'Enviar disponibilidad de noviembre' }, notes: [{ at: iso(-5, 16), author: 'Marta', text: 'Hace 2-3 sesiones al mes. Le interesa el pack de 10 horas.' }] },
    { id: 'l-06', name: 'Xián Otero', email: 'xian@oterogestion.example', phone: '600 200 306', company: 'Otero Xestión', sedeId: 'lugo', interest: 'Puesto flexible', source: 'Referido', stage: 'contactado', value: 149, owner: 'Marta', createdAt: iso(-3), nextAction: { date: day(2), text: 'Recordatorio por email' }, notes: [] },
    { id: 'l-07', name: 'Aldara Pena', email: 'aldara@penaconsult.example', phone: '600 200 307', company: 'Pena Consultores', sedeId: 'coruna', interest: 'Pack Chatroom 10 h', source: 'Web', stage: 'visita', value: 100, owner: 'Sergio', createdAt: iso(-9), nextAction: { date: day(1), text: 'Visita a las 12:00' }, notes: [{ at: iso(-7), author: 'Sergio', text: 'Reuniones semanales con clientes. Visita confirmada.' }] },
    { id: 'l-08', name: 'Breogán Lema', email: 'breogan@lemasoft.example', phone: '600 200 308', company: 'Lema Software', sedeId: 'lugo', interest: '4 puestos + sala', source: 'Google', stage: 'visita', value: 796, owner: 'Marta', createdAt: iso(-8), nextAction: { date: day(3), text: 'Visita a la sede de Lugo' }, notes: [{ at: iso(-6), author: 'Marta', text: 'Empresa de 4 personas que deja su oficina actual en diciembre.' }] },
    { id: 'l-09', name: 'Silvia Cancela', email: 'silvia@cancelaeventos.example', phone: '600 200 309', company: 'Cancela Eventos', sedeId: 'coruna', interest: 'Atlantic Studio, evento de marca', source: 'Referido', stage: 'propuesta', value: 320, owner: 'Sergio', createdAt: iso(-14), nextAction: { date: day(0), text: 'Seguimiento de la propuesta' }, notes: [{ at: iso(-10), author: 'Sergio', text: 'Presentación de producto para 12 personas. Enviada propuesta de día completo.' }] },
    { id: 'l-10', name: 'Mateo Rial', email: 'mateo@rialfinanzas.example', phone: '600 200 310', company: 'Rial Finanzas', sedeId: 'coruna', interest: 'Puesto The Hive Basic', source: 'Web', stage: 'propuesta', value: 149, owner: 'Marta', createdAt: iso(-12), nextAction: { date: day(4), text: 'Llamar si no responde' }, notes: [] },
    { id: 'l-11', name: 'Icía Dopico', email: 'icia@dopicoarq.example', phone: '600 200 311', company: 'Dopico Arquitectura', sedeId: 'lugo', interest: 'Puesto flexible', source: 'Visita', stage: 'ganado', value: 199, owner: 'Marta', createdAt: iso(-20), nextAction: null, notes: [{ at: iso(-5), author: 'Marta', text: 'Alta firmada. Empieza el día 1.' }] },
    { id: 'l-12', name: 'Roque Tubío', email: 'roque@tubiomedia.example', phone: '600 200 312', company: 'Tubío Media', sedeId: 'coruna', interest: 'Puesto The Hive Plus', source: 'LinkedIn', stage: 'perdido', value: 199, owner: 'Sergio', createdAt: iso(-25), nextAction: null, notes: [{ at: iso(-11), author: 'Sergio', text: 'Se queda trabajando desde casa de momento. Volver a contactar en primavera.' }] },
  ];
}

function buildTickets(today: Date): Ticket[] {
  const iso = (d: number, h = 10) => {
    const x = addDays(today, d);
    x.setHours(h, 30, 0, 0);
    return x.toISOString();
  };
  return [
    {
      id: 't-01', memberId: 'm-lucia', sedeId: 'coruna', subject: 'Factura de octubre con otra razón social', category: 'Facturación', status: 'en curso', createdAt: iso(-3),
      messages: [
        { at: iso(-3), from: 'miembro', author: 'Lucía Varela', text: 'Hola, necesito que la factura de octubre salga a nombre de Varela Estudio S.L. en lugar de mi nombre.' },
        { at: iso(-2, 9), from: 'equipo', author: 'Marta (NODO)', text: 'Hola Lucía, sin problema. ¿Nos pasas el CIF y la dirección fiscal y la rehacemos hoy?' },
      ],
    },
    {
      id: 't-02', memberId: 'm-iago', sedeId: 'coruna', subject: 'El fondo fotográfico tiene una marca', category: 'Instalaciones', status: 'abierta', createdAt: iso(-1, 18),
      messages: [{ at: iso(-1, 18), from: 'miembro', author: 'Iago Souto', text: 'Al terminar la sesión de hoy vi una marca en la parte baja del fondo blanco de Atlantic Studio. Aviso por si hay que cambiar el rollo.' }],
    },
    {
      id: 't-03', memberId: 'm-uxia', sedeId: 'lugo', subject: '¿Puedo traer a un cliente a la zona de puestos?', category: 'Otro', status: 'abierta', createdAt: iso(0, 9),
      messages: [{ at: iso(0, 9), from: 'miembro', author: 'Uxía Ferreiro', text: 'Mañana viene un cliente un par de horas. ¿Puede sentarse conmigo o tengo que reservar la sala?' }],
    },
    {
      id: 't-04', memberId: 'm-brais', sedeId: 'coruna', subject: 'Cambio de plan a Plus', category: 'Suscripción', status: 'resuelta', createdAt: iso(-9),
      messages: [
        { at: iso(-9), from: 'miembro', author: 'Brais Castro', text: '¿Desde cuándo se aplicaría el cambio si paso a Plus?' },
        { at: iso(-8), from: 'equipo', author: 'Sergio (NODO)', text: 'Desde el día 1 del mes siguiente. Puedes solicitarlo tú mismo en la sección Suscripción del portal.' },
      ],
    },
  ];
}

function buildInvoices(today: Date): Invoice[] {
  const out: Invoice[] = [];
  let n = 118;
  for (let back = 3; back >= 0; back--) {
    const d = new Date(today.getFullYear(), today.getMonth() - back, 1);
    for (const m of MEMBERS) {
      if (!m.planId || m.status === 'baja') continue;
      if (d < new Date(m.since)) continue;
      if (m.status === 'pausado' && back < 2) continue;
      const plan = PLANS.find((p) => p.id === m.planId)!;
      out.push({
        id: `f-${n}`,
        number: `N26-${String(n++).padStart(4, '0')}`,
        memberId: m.id,
        sedeId: m.sedeId,
        date: toISODate(d),
        concept: `${plan.name} · ${d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
        amount: plan.price,
        status: back === 0 && ['m-antia', 'm-anxo', 'm-sabela'].includes(m.id) ? 'pendiente' : 'pagada',
      });
    }
  }
  return out;
}

export function buildSeed(now = new Date()): DemoState {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const bookings = buildBookings(today);

  // El miembro de la demo siempre tiene reservas próximas y pasadas que enseñar.
  const mine = (offset: number, spaceId: string, start: number, end: number, status: Booking['status'] = 'confirmada') => {
    const space = SPACES.find((s) => s.id === spaceId)!;
    const date = toISODate(addDays(today, offset));
    const clash = bookings.findIndex((b) => b.spaceId === spaceId && b.date === date && b.start < end && start < b.end && space.units === 1);
    if (clash >= 0) bookings.splice(clash, 1);
    bookings.push({
      id: `b-me-${offset}-${spaceId}`, spaceId, sedeId: space.sedeId, memberId: 'm-lucia', date, start, end, status, source: 'portal',
      price: space.mode === 'jornada' ? 0 : ((end - start) / 60) * space.rateMember,
      createdAt: addDays(today, offset - 4).toISOString(),
    });
  };
  const nextWorkday = (from: number) => {
    let o = from;
    while (addDays(today, o).getDay() === 0) o++;
    return o;
  };
  mine(nextWorkday(1), 'cor-chatroom', H(10), H(12));
  mine(nextWorkday(4), 'cor-atlantic', H(16), H(18), 'pendiente');
  mine(nextWorkday(8), 'cor-chatroom', H(9), H(10));
  const prevWorkday = (from: number) => {
    let o = from;
    while (addDays(today, o).getDay() === 0) o--;
    return o;
  };
  mine(prevWorkday(-3), 'cor-chatroom', H(11), H(13));
  mine(prevWorkday(-9), 'cor-office', H(16), H(17));

  return {
    version: STATE_VERSION,
    seededOn: toISODate(today),
    currentMemberId: 'm-lucia',
    spaces: SPACES,
    plans: PLANS,
    members: MEMBERS,
    bookings,
    leads: buildLeads(today),
    tickets: buildTickets(today),
    invoices: buildInvoices(today),
  };
}
