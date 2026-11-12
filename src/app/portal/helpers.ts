// Utilidades propias del portal de miembros.

import { todayISO } from '../dates';
import { fmtMoney } from '../dates';
import type { Booking, DemoState, Member } from '../types';

export interface ViewProps {
  state: DemoState;
  me: Member;
  go: (route: string) => void;
  /** Segundo tramo de la ruta, p. ej. "nueva" en #/consultas/nueva. */
  param?: string;
}

export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** Una reserva sigue siendo "próxima" hasta que termina. */
export function isUpcoming(b: Booking): boolean {
  const today = todayISO();
  return b.date > today || (b.date === today && b.end > nowMinutes());
}

export const byDateAsc = (a: Booking, b: Booking) => a.date.localeCompare(b.date) || a.start - b.start;
export const byDateDesc = (a: Booking, b: Booking) => -byDateAsc(a, b);

/** Importe de una reserva tal y como lo lee un miembro. */
export function priceLabel(price: number): string {
  return price === 0 ? 'Incluido en tu plan' : `${fmtMoney(price)} + IVA`;
}

export const firstName = (name: string) => name.split(' ')[0];
