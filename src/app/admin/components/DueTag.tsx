// Aviso de seguimiento de un lead: vencido o para hoy. Es la misma
// etiqueta en el tablero, en la ficha y en el resumen.

import { CalendarClock } from 'lucide-react';
import type { Lead } from '../../types';

export function dueState(lead: Lead, today: string): 'late' | 'today' | null {
  if (!lead.nextAction || lead.stage === 'ganado' || lead.stage === 'perdido') return null;
  if (lead.nextAction.date < today) return 'late';
  if (lead.nextAction.date === today) return 'today';
  return null;
}

export default function DueTag({ lead, today }: { lead: Lead; today: string }) {
  const d = dueState(lead, today);
  if (!d) return null;
  return (
    <span className={`due ${d === 'late' ? 'due--late' : ''}`}>
      <CalendarClock size={12} aria-hidden="true" /> {d === 'late' ? 'Seguimiento vencido' : 'Seguimiento hoy'}
    </span>
  );
}
