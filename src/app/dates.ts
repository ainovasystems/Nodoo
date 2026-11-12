// Utilidades de fecha y formato para la demo. Fechas como 'YYYY-MM-DD'
// en hora local y horas como minutos desde medianoche.

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export const todayISO = () => toISODate(new Date());

export function shiftISO(date: string, n: number): string {
  return toISODate(addDays(fromISODate(date), n));
}

/** Lunes de la semana a la que pertenece la fecha. */
export function weekStart(date: string): string {
  const d = fromISODate(date);
  const diff = (d.getDay() + 6) % 7;
  return toISODate(addDays(d, -diff));
}

export function fmtTime(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function fmtRange(start: number, end: number): string {
  return `${fmtTime(start)} – ${fmtTime(end)}`;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "jueves, 12 de noviembre" */
export function fmtDateLong(date: string): string {
  return cap(fromISODate(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
}

/** "jue 12 nov" */
export function fmtDateShort(date: string): string {
  return fromISODate(date)
    .toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '')
    .replace(',', '');
}

/** "12/11/2026" */
export function fmtDateNum(date: string): string {
  return fromISODate(date).toLocaleDateString('es-ES');
}

/** Para marcas de tiempo ISO: "12 nov, 10:15" */
export function fmtStamp(iso: string): string {
  return new Date(iso)
    .toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    .replace(/\./g, '');
}

/** "Hoy", "Mañana", "Ayer" o la fecha corta. */
export function fmtRelativeDay(date: string): string {
  const t = todayISO();
  if (date === t) return 'Hoy';
  if (date === shiftISO(t, 1)) return 'Mañana';
  if (date === shiftISO(t, -1)) return 'Ayer';
  return cap(fmtDateShort(date));
}

// useGrouping 'always': en es-ES los miles de cuatro cifras no se separan por defecto (2475 → 2.475).
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 0, useGrouping: 'always' });
export const fmtMoney = (n: number) => money.format(n);

export function hoursBetween(start: number, end: number): number {
  return (end - start) / 60;
}

export function fmtHours(h: number): string {
  return `${String(h).replace('.', ',')} h`;
}

/** Día de la semana abreviado: "lun", "mar"… */
export function fmtWeekdayShort(date: string): string {
  return fromISODate(date).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
}

/** Minutos transcurridos desde medianoche, ahora. */
export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
