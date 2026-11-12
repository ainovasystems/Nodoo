// Calendario de reservas: vista de día por espacio y vista de semana
// de un espacio. Clic en un hueco crea una reserva; clic en un bloque
// abre su detalle.

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button, Field, IconButton, PageHead, SEDE_LABEL, SedeTag, Segmented } from '../../ui';
import { bookingWho, inSede, useDemo } from '../../store';
import { fmtDateLong, fmtDateShort, fmtRange, fmtTime, fmtWeekdayShort, nowMinutes, shiftISO, todayISO } from '../../dates';
import type { Booking, DemoState, Space } from '../../types';
import BookingModal, { type BookingDraft } from '../components/BookingModal';
import BookingDetail from '../components/BookingDetail';
import { isActive, isToday, SEDE_ORDER, useSede, weekDates } from '../helpers';

const DAY_START = 7 * 60;
const DAY_END = 24 * 60;
const HOUR_PX = 48;
const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => DAY_START + i * 60);
const top = (min: number) => ((min - DAY_START) / 60) * HOUR_PX;

interface ColumnProps {
  s: DemoState;
  space: Space;
  date: string;
  onSlot: (draft: BookingDraft) => void;
  onBooking: (id: string) => void;
}

function SpaceColumn({ s, space, date, onSlot, onBooking }: ColumnProps) {
  const bookings = s.bookings
    .filter((b) => b.spaceId === space.id && b.date === date && isActive(b))
    .sort((a, b) => a.start - b.start);
  const now = nowMinutes();

  if (space.mode === 'jornada') {
    const free = space.units - bookings.length;
    return (
      <div className="cal__col cal__col--pool">
        <div className="cal__pool">
          <p className="cal__pool-count">
            {bookings.length} de {space.units} puestos reservados
          </p>
          {bookings.length > 0 && (
            <ul className="cal__pool-list">
              {bookings.map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => onBooking(b.id)}>
                    {bookingWho(s, b)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {free > 0 ? (
            <Button size="sm" variant="ghost" icon={<Plus size={14} aria-hidden="true" />} onClick={() => onSlot({ spaceId: space.id, date })}>
              Reservar puesto
            </Button>
          ) : (
            <p className="muted">Sin puestos libres este día.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cal__col" style={{ height: HOURS.length * HOUR_PX }}>
      {HOURS.map((h) =>
        h < space.open || h >= space.close ? (
          <div key={h} className="cal__closed" style={{ top: top(h) }} title="Fuera del horario del espacio" />
        ) : (
          <button
            key={h}
            type="button"
            className="cal__slot"
            style={{ top: top(h) }}
            aria-label={`Reservar ${space.name} el ${fmtDateShort(date)} a las ${fmtTime(h)}`}
            onClick={() => onSlot({ spaceId: space.id, date, start: h })}
          />
        ),
      )}
      {bookings.map((b: Booking) => (
        <button
          key={b.id}
          type="button"
          className={`cal__event cal__event--${b.status}`}
          style={{ top: top(b.start) + 1, height: ((b.end - b.start) / 60) * HOUR_PX - 2 }}
          onClick={() => onBooking(b.id)}
        >
          <span className="cal__event-who">{bookingWho(s, b)}</span>
          <span className="cal__event-time">
            {fmtRange(b.start, b.end)}
            {b.status === 'pendiente' && ' · Pendiente'}
          </span>
        </button>
      ))}
      {isToday(date) && now >= DAY_START && now < DAY_END && <div className="cal__now" style={{ top: top(now) }} aria-hidden="true" />}
    </div>
  );
}

export default function Calendario() {
  const s = useDemo();
  const sede = useSede();
  const [mode, setMode] = useState<'dia' | 'semana'>('dia');
  const [date, setDate] = useState(todayISO());
  const [weekSpace, setWeekSpace] = useState('');
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  const spaces = inSede(s.spaces, sede);
  const space = spaces.find((sp) => sp.id === weekSpace) ?? spaces[0];
  const week = weekDates(date);
  const step = mode === 'dia' ? 1 : 7;

  const groups = sede === 'todas' ? SEDE_ORDER.map((id) => ({ id, count: spaces.filter((sp) => sp.sedeId === id).length })) : null;
  const columns = mode === 'dia' ? spaces.map((sp) => ({ key: sp.id, space: sp, date })) : week.map((d) => ({ key: d, space, date: d }));

  const title = mode === 'dia' ? fmtDateLong(date) : `Semana del ${fmtDateShort(week[0])} al ${fmtDateShort(week[6])}`;

  return (
    <>
      <PageHead title="Calendario" subtitle={title}>
        <Button variant="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={() => setDraft({ date, spaceId: mode === 'semana' ? space.id : undefined })}>
          Nueva reserva
        </Button>
      </PageHead>

      <div className="toolbar">
        <Segmented
          label="Vista"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'dia', label: 'Día' },
            { value: 'semana', label: 'Semana' },
          ]}
        />
        <div className="cluster">
          <IconButton label={mode === 'dia' ? 'Día anterior' : 'Semana anterior'} onClick={() => setDate(shiftISO(date, -step))}>
            <ChevronLeft size={18} />
          </IconButton>
          <Button size="sm" onClick={() => setDate(todayISO())}>
            Hoy
          </Button>
          <IconButton label={mode === 'dia' ? 'Día siguiente' : 'Semana siguiente'} onClick={() => setDate(shiftISO(date, step))}>
            <ChevronRight size={18} />
          </IconButton>
        </div>
        <div className="toolbar__field">
          <Field label="Ir a la fecha">{(id) => <input id={id} type="date" className="input" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />}</Field>
        </div>
        {mode === 'semana' && (
          <div className="toolbar__field">
            <Field label="Espacio">
              {(id) => (
                <select id={id} className="select" value={space.id} onChange={(e) => setWeekSpace(e.target.value)}>
                  {spaces.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name}
                      {sede === 'todas' ? ` · ${SEDE_LABEL[sp.sedeId]}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        )}
        <ul className="cal-legend" aria-label="Leyenda">
          <li>
            <span className="cal-legend__swatch cal-legend__swatch--confirmada" /> Confirmada
          </li>
          <li>
            <span className="cal-legend__swatch cal-legend__swatch--pendiente" /> Pendiente
          </li>
        </ul>
      </div>

      <div className="cal" style={{ ['--cal-head-top' as string]: groups && mode === 'dia' ? '32px' : '0px' }}>
        <div className="cal__grid" style={{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(${mode === 'dia' ? 148 : 128}px, 1fr))` }}>
          {groups && mode === 'dia' && (
            <>
              <div className="cal__corner cal__corner--group" />
              {groups.map((g) => (
                <div key={g.id} className="cal__group" style={{ gridColumn: `span ${g.count}` }}>
                  <SedeTag sede={g.id} />
                </div>
              ))}
            </>
          )}

          <div className="cal__corner" />
          {columns.map((c) =>
            mode === 'dia' ? (
              <div key={c.key} className="cal__head">
                <span className="cal__head-name">{c.space.name}</span>
                <span className="cal__head-sub">{c.space.mode === 'jornada' ? `${c.space.units} puestos` : `Hasta ${c.space.capacity} personas`}</span>
              </div>
            ) : (
              <div key={c.key} className={`cal__head ${isToday(c.date) ? 'is-today' : ''}`}>
                <span className="cal__head-name cal__head-name--day">
                  {fmtWeekdayShort(c.date)} {Number(c.date.slice(8))}
                </span>
                <span className="cal__head-sub">{isToday(c.date) ? 'Hoy' : ' '}</span>
              </div>
            ),
          )}

          <div className="cal__times" style={{ height: HOURS.length * HOUR_PX }} aria-hidden="true">
            {HOURS.map((h) => (
              <span key={h} style={{ top: top(h) }}>
                {fmtTime(h)}
              </span>
            ))}
          </div>
          {columns.map((c) => (
            <SpaceColumn key={c.key} s={s} space={c.space} date={c.date} onSlot={setDraft} onBooking={setDetail} />
          ))}
        </div>
      </div>

      <BookingModal open={draft !== null} onClose={() => setDraft(null)} draft={draft ?? undefined} />
      <BookingDetail bookingId={detail} onClose={() => setDetail(null)} />
    </>
  );
}
