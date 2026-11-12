// Almacén de la demo. No hay servidor: el estado vive en localStorage y se
// comparte entre el portal, el panel y el formulario de la web pública, de
// modo que lo que se hace en un sitio se ve en el otro. En producción, cada
// acción de este archivo sería una llamada a la API.

import { useSyncExternalStore } from 'react';
import { buildSeed, STATE_VERSION } from './seed';
import { todayISO } from './dates';
import type { Booking, DemoState, Lead, LeadStage, Member, SedeId, Space, Ticket, TicketStatus } from './types';

const KEY = 'nodo-demo-state';
export const LEAD_INBOX_KEY = 'nodo-demo-lead-inbox';

let state: DemoState | null = null;
const listeners = new Set<() => void>();

function read(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch {
    // Almacenamiento bloqueado o dañado: se trabaja en memoria.
  }
  return buildSeed();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Sin almacenamiento, la demo sigue funcionando hasta recargar.
  }
}

/** Recoge los contactos enviados desde el formulario de la web pública. */
function drainLeadInbox(s: DemoState): DemoState {
  try {
    const raw = localStorage.getItem(LEAD_INBOX_KEY);
    if (!raw) return s;
    const incoming = JSON.parse(raw) as Lead[];
    localStorage.removeItem(LEAD_INBOX_KEY);
    if (!Array.isArray(incoming) || incoming.length === 0) return s;
    const known = new Set(s.leads.map((l) => l.id));
    return { ...s, leads: [...incoming.filter((l) => !known.has(l.id)), ...s.leads] };
  } catch {
    return s;
  }
}

function ensure(): DemoState {
  if (!state) {
    state = drainLeadInbox(read());
    persist();
    window.addEventListener('storage', (e) => {
      if (e.key === KEY || e.key === LEAD_INBOX_KEY) {
        state = drainLeadInbox(read());
        if (e.key === LEAD_INBOX_KEY) persist();
        listeners.forEach((l) => l());
      }
    });
  }
  return state;
}

function set(next: DemoState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState(): DemoState {
  return ensure();
}

/** Estado completo de la demo. Vuelve a renderizar cuando cambia. */
export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, ensure, ensure);
}

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// ---------- Consultas ----------

export const spaceById = (s: DemoState, id: string): Space => s.spaces.find((x) => x.id === id)!;
export const memberById = (s: DemoState, id: string | null): Member | undefined =>
  id ? s.members.find((x) => x.id === id) : undefined;
export const planById = (s: DemoState, id: string | null) => (id ? s.plans.find((p) => p.id === id) : undefined);

/** Nombre de quien ocupa la reserva: el miembro o el cliente externo. */
export function bookingWho(s: DemoState, b: Booking): string {
  return memberById(s, b.memberId)?.name ?? b.guestName ?? 'Cliente externo';
}

/** Unidades libres de un espacio en una franja. Las reservas canceladas no ocupan. */
export function freeUnits(s: DemoState, spaceId: string, date: string, start: number, end: number, ignoreId?: string): number {
  const space = spaceById(s, spaceId);
  const taken = s.bookings.filter(
    (b) => b.spaceId === spaceId && b.date === date && b.status !== 'cancelada' && b.id !== ignoreId && b.start < end && start < b.end,
  ).length;
  return Math.max(0, space.units - taken);
}

export function priceFor(space: Space, start: number, end: number, isMember: boolean): number {
  const rate = isMember ? space.rateMember : space.rateExternal;
  if (space.mode === 'jornada') return rate;
  return Math.round(((end - start) / 60) * rate * 100) / 100;
}

export function inSede<T extends { sedeId: SedeId }>(items: T[], sede: SedeId | 'todas'): T[] {
  return sede === 'todas' ? items : items.filter((i) => i.sedeId === sede);
}

/** Ingresos recurrentes mensuales: suma de los planes de miembros activos. */
export function monthlyRecurring(s: DemoState, sede: SedeId | 'todas'): number {
  return inSede(s.members, sede)
    .filter((m) => m.status === 'activo')
    .reduce((sum, m) => sum + (planById(s, m.planId)?.price ?? 0), 0);
}

// ---------- Acciones ----------

export interface NewBooking {
  spaceId: string;
  memberId: string | null;
  guestName?: string;
  date: string;
  start: number;
  end: number;
  source: Booking['source'];
  status?: Booking['status'];
  notes?: string;
  price?: number;
}

/** Crea la reserva si hay hueco. Devuelve un error legible si no lo hay. */
export function createBooking(input: NewBooking): { ok: true; booking: Booking } | { ok: false; error: string } {
  const s = ensure();
  const space = spaceById(s, input.spaceId);
  if (input.end <= input.start) return { ok: false, error: 'La hora de fin debe ser posterior a la de inicio.' };
  if (input.start < space.open || input.end > space.close)
    return { ok: false, error: `${space.name} no está disponible en ese horario.` };
  if (freeUnits(s, input.spaceId, input.date, input.start, input.end) === 0)
    return { ok: false, error: 'Esa franja ya está ocupada. Elige otra hora u otro espacio.' };
  const booking: Booking = {
    id: uid('b'),
    spaceId: input.spaceId,
    sedeId: space.sedeId,
    memberId: input.memberId,
    guestName: input.guestName,
    date: input.date,
    start: input.start,
    end: input.end,
    status: input.status ?? 'confirmada',
    source: input.source,
    notes: input.notes,
    price: input.price ?? priceFor(space, input.start, input.end, Boolean(input.memberId)),
    createdAt: new Date().toISOString(),
  };
  set({ ...s, bookings: [...s.bookings, booking] });
  return { ok: true, booking };
}

export function setBookingStatus(id: string, status: Booking['status']) {
  const s = ensure();
  set({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)) });
}

export interface NewLead {
  name: string;
  email: string;
  phone: string;
  company: string;
  sedeId: SedeId;
  interest: string;
  source: Lead['source'];
  message?: string;
  value?: number;
}

export function buildLead(input: NewLead): Lead {
  return {
    id: uid('l'),
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    sedeId: input.sedeId,
    interest: input.interest,
    source: input.source,
    stage: 'nuevo',
    value: input.value ?? 0,
    owner: 'Sin asignar',
    createdAt: new Date().toISOString(),
    nextAction: null,
    notes: [],
    message: input.message,
  };
}

export function createLead(input: NewLead): Lead {
  const s = ensure();
  const lead = buildLead(input);
  set({ ...s, leads: [lead, ...s.leads] });
  return lead;
}

export function updateLead(id: string, patch: Partial<Omit<Lead, 'id'>>) {
  const s = ensure();
  set({ ...s, leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
}

export function moveLead(id: string, stage: LeadStage) {
  updateLead(id, { stage });
}

export function addLeadNote(id: string, text: string, author = 'Equipo NODO') {
  const s = ensure();
  set({
    ...s,
    leads: s.leads.map((l) =>
      l.id === id ? { ...l, notes: [...l.notes, { at: new Date().toISOString(), author, text }] } : l,
    ),
  });
}

/** Da de alta como miembro a un lead ganado. */
export function convertLead(id: string, planId: string | null): Member | undefined {
  const s = ensure();
  const lead = s.leads.find((l) => l.id === id);
  if (!lead) return undefined;
  const member: Member = {
    id: uid('m'),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    sedeId: lead.sedeId,
    planId,
    status: 'activo',
    since: todayISO(),
  };
  set({
    ...s,
    members: [...s.members, member],
    leads: s.leads.map((l) => (l.id === id ? { ...l, stage: 'ganado', nextAction: null } : l)),
  });
  return member;
}

export function updateMember(id: string, patch: Partial<Omit<Member, 'id'>>) {
  const s = ensure();
  set({ ...s, members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
}

export function createTicket(input: { memberId: string; subject: string; category: Ticket['category']; text: string }): Ticket {
  const s = ensure();
  const member = memberById(s, input.memberId)!;
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: uid('t'),
    memberId: member.id,
    sedeId: member.sedeId,
    subject: input.subject,
    category: input.category,
    status: 'abierta',
    createdAt: now,
    messages: [{ at: now, from: 'miembro', author: member.name, text: input.text }],
  };
  set({ ...s, tickets: [ticket, ...s.tickets] });
  return ticket;
}

export function replyTicket(id: string, from: 'miembro' | 'equipo', author: string, text: string) {
  const s = ensure();
  set({
    ...s,
    tickets: s.tickets.map((t) =>
      t.id === id
        ? {
            ...t,
            status: from === 'equipo' && t.status === 'abierta' ? 'en curso' : from === 'miembro' && t.status === 'resuelta' ? 'abierta' : t.status,
            messages: [...t.messages, { at: new Date().toISOString(), from, author, text }],
          }
        : t,
    ),
  });
}

export function setTicketStatus(id: string, status: TicketStatus) {
  const s = ensure();
  set({ ...s, tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) });
}

export function setInvoiceStatus(id: string, status: 'pagada' | 'pendiente') {
  const s = ensure();
  set({ ...s, invoices: s.invoices.map((i) => (i.id === id ? { ...i, status } : i)) });
}

/** Devuelve la demo a los datos iniciales. */
export function resetDemo() {
  try {
    localStorage.removeItem(LEAD_INBOX_KEY);
  } catch {
    // nada que limpiar
  }
  set(buildSeed());
}
