import type { SedeId } from '@/data/site';

export type { SedeId };

export type SpaceKind = 'sala' | 'estudio' | 'puestos';

export interface Space {
  id: string;
  sedeId: SedeId;
  name: string;
  kind: SpaceKind;
  /** Personas que caben en la sala (o por puesto, 1). */
  capacity: number;
  /** Unidades reservables a la vez: 1 en una sala, N en una zona de puestos. */
  units: number;
  /** Apertura y cierre en minutos desde medianoche. */
  open: number;
  close: number;
  /** Las salas se reservan por horas; los puestos, por jornada completa. */
  mode: 'horas' | 'jornada';
  /** Tarifas orientativas de la demo, en € sin IVA. Por hora, o por jornada en puestos. */
  rateExternal: number;
  rateMember: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
}

export type MemberStatus = 'activo' | 'pausado' | 'baja';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  sedeId: SedeId;
  planId: string | null;
  status: MemberStatus;
  since: string; // YYYY-MM-DD
}

export type BookingStatus = 'confirmada' | 'pendiente' | 'cancelada';

export interface Booking {
  id: string;
  spaceId: string;
  sedeId: SedeId;
  memberId: string | null;
  /** Nombre del cliente cuando no es miembro. */
  guestName?: string;
  date: string; // YYYY-MM-DD
  start: number; // minutos desde medianoche
  end: number;
  status: BookingStatus;
  source: 'portal' | 'panel' | 'web';
  notes?: string;
  price: number;
  createdAt: string; // ISO
}

export type LeadStage = 'nuevo' | 'contactado' | 'visita' | 'propuesta' | 'ganado' | 'perdido';

export interface LeadNote {
  at: string; // ISO
  author: string;
  text: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  sedeId: SedeId;
  interest: string;
  source: 'Web' | 'Instagram' | 'LinkedIn' | 'Referido' | 'Google' | 'Visita';
  stage: LeadStage;
  /** Valor mensual estimado, € sin IVA. */
  value: number;
  owner: string;
  createdAt: string; // ISO
  nextAction: { date: string; text: string } | null;
  notes: LeadNote[];
  message?: string;
}

export type TicketStatus = 'abierta' | 'en curso' | 'resuelta';

export interface TicketMessage {
  at: string; // ISO
  from: 'miembro' | 'equipo';
  author: string;
  text: string;
}

export interface Ticket {
  id: string;
  memberId: string;
  sedeId: SedeId;
  subject: string;
  category: 'Reservas' | 'Facturación' | 'Instalaciones' | 'Suscripción' | 'Otro';
  status: TicketStatus;
  createdAt: string; // ISO
  messages: TicketMessage[];
}

export interface Invoice {
  id: string;
  number: string;
  memberId: string;
  sedeId: SedeId;
  date: string; // YYYY-MM-DD
  concept: string;
  amount: number; // € sin IVA
  status: 'pagada' | 'pendiente';
}

export interface DemoState {
  version: number;
  seededOn: string;
  /** Miembro con el que se entra al portal en la demo. */
  currentMemberId: string;
  spaces: Space[];
  plans: Plan[];
  members: Member[];
  bookings: Booking[];
  leads: Lead[];
  tickets: Ticket[];
  invoices: Invoice[];
}

export const LEAD_STAGES: { id: LeadStage; label: string }[] = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'visita', label: 'Visita agendada' },
  { id: 'propuesta', label: 'Propuesta enviada' },
  { id: 'ganado', label: 'Ganado' },
  { id: 'perdido', label: 'Perdido' },
];
