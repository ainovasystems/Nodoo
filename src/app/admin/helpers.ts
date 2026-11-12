// Utilidades propias del panel interno.

import { createContext, useContext } from 'react';
import { fromISODate, shiftISO, todayISO, weekStart } from '../dates';
import type { Booking, DemoState, SedeId, Space } from '../types';

export type SedeFilter = SedeId | 'todas';

export const SedeContext = createContext<SedeFilter>('todas');
/** Sede elegida en el filtro global del panel. */
export const useSede = () => useContext(SedeContext);

export const SEDE_ORDER: SedeId[] = ['coruna', 'lugo'];

/** Las siete fechas (lunes a domingo) de la semana de `date`. */
export function weekDates(date: string): string[] {
  const start = weekStart(date);
  return Array.from({ length: 7 }, (_, i) => shiftISO(start, i));
}

/** Días laborables de la semana: de lunes a sábado. */
export const workWeek = (date: string) => weekDates(date).slice(0, 6);

export const isActive = (b: Booking) => b.status !== 'cancelada';

/**
 * Ocupación de un espacio en un conjunto de días, de 0 a 1.
 * Salas: horas reservadas sobre horas abiertas. Puestos: jornadas
 * reservadas sobre puestos disponibles.
 */
export function occupancy(s: DemoState, space: Space, dates: string[]): { used: number; total: number; ratio: number } {
  const set = new Set(dates);
  const bookings = s.bookings.filter((b) => b.spaceId === space.id && isActive(b) && set.has(b.date));
  if (space.mode === 'jornada') {
    const total = space.units * dates.length;
    return { used: bookings.length, total, ratio: total ? bookings.length / total : 0 };
  }
  const used = bookings.reduce((sum, b) => sum + (b.end - b.start), 0) / 60;
  const total = ((space.close - space.open) / 60) * dates.length;
  return { used, total, ratio: total ? used / total : 0 };
}

export const fmtPct = (ratio: number) => `${Math.round(ratio * 100)} %`;

export const KIND_LABEL: Record<Space['kind'], string> = {
  sala: 'Sala de reuniones',
  estudio: 'Sala y estudio',
  puestos: 'Zona de puestos',
};

export const SOURCE_LABEL: Record<Booking['source'], string> = { portal: 'Portal', panel: 'Panel', web: 'Web' };

/** Ordena reservas por fecha y hora. */
export const byWhen = (a: Booking, b: Booking) => a.date.localeCompare(b.date) || a.start - b.start;

/** "jue" para cabeceras de calendario. */
export function weekdayShort(date: string): string {
  return fromISODate(date).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
}

export const isToday = (date: string) => date === todayISO();

/** Minutos transcurridos hoy desde medianoche. */
export function nowMinutes(): number {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}
