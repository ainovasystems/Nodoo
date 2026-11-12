import { useMemo, useState } from 'react';
import { Clock, Users } from 'lucide-react';
import { fmtDateLong, fmtMoney, fmtRange, fmtTime, fromISODate, shiftISO, todayISO } from '../../dates';
import { createBooking, freeUnits, priceFor } from '../../store';
import { Button, PageHead, SEDE_LABEL, Segmented, useToast } from '../../ui';
import type { SedeId, Space } from '../../types';
import { nowMinutes, priceLabel, type ViewProps } from '../helpers';

const MAX_HOURS = 4;

/** Próximos 14 días reservables. Los domingos no se ofrecen. */
function nextDays(): string[] {
  const out: string[] = [];
  const today = todayISO();
  for (let i = 0; out.length < 14; i++) {
    const d = shiftISO(today, i);
    if (fromISODate(d).getDay() !== 0) out.push(d);
  }
  return out;
}

function rateText(space: Space): string {
  if (space.mode === 'jornada') return 'Incluido en tu plan · jornada completa';
  return `${fmtMoney(space.rateMember)}/h + IVA, tarifa de miembro`;
}

export function Reservar({ state, me, go }: ViewProps) {
  const toast = useToast();
  const today = todayISO();
  const days = useMemo(nextDays, [today]);

  const [sede, setSede] = useState<SedeId>(me.sedeId);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [date, setDate] = useState(days[0]);
  const [start, setStart] = useState<number | null>(null);
  const [hours, setHours] = useState(1);
  const [fullDay, setFullDay] = useState(false);
  const [error, setError] = useState('');

  const spaces = state.spaces.filter((s) => s.sedeId === sede);
  const space = spaces.find((s) => s.id === spaceId) ?? null;

  const resetSlot = () => {
    setStart(null);
    setHours(1);
    setFullDay(false);
    setError('');
  };

  const now = nowMinutes();
  const isPast = (minute: number) => date === today && minute <= now;

  // Duraciones que caben desde la hora elegida sin pisar otra reserva ni el cierre.
  const durations: number[] = [];
  if (space && space.mode === 'horas' && start !== null) {
    for (let h = 1; h <= MAX_HOURS; h++) {
      const end = start + h * 60;
      if (end > space.close || freeUnits(state, space.id, date, start, end) === 0) break;
      durations.push(h);
    }
  }
  const safeHours = durations.includes(hours) ? hours : 1;

  const range: { start: number; end: number } | null = !space
    ? null
    : space.mode === 'jornada'
      ? fullDay
        ? { start: space.open, end: space.close }
        : null
      : start !== null
        ? { start, end: start + safeHours * 60 }
        : null;

  const deskFree = space && space.mode === 'jornada' ? freeUnits(state, space.id, date, space.open, space.close) : 0;
  const deskMine =
    space && space.mode === 'jornada'
      ? state.bookings.some((b) => b.spaceId === space.id && b.date === date && b.memberId === me.id && b.status !== 'cancelada')
      : false;
  const deskClosed = space ? date === today && now >= space.close : false;

  const confirm = () => {
    if (!space || !range) return;
    const result = createBooking({ spaceId: space.id, memberId: me.id, date, start: range.start, end: range.end, source: 'portal' });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast('Reserva confirmada');
    go('reservas');
  };

  const slots: number[] = [];
  if (space && space.mode === 'horas') {
    for (let m = space.open; m + 60 <= space.close; m += 60) slots.push(m);
  }

  return (
    <>
      <PageHead title="Reservar" subtitle="Elige sede, espacio, día y hora. La reserva queda confirmada al momento." />

      <div className="book">
        <div className="stack book__steps">
          <section className="card" aria-labelledby="step-sede">
            <h2 className="step-title" id="step-sede">
              <span className="step-title__n">1</span> Sede
            </h2>
            <Segmented
              label="Sede"
              value={sede}
              onChange={(v) => {
                setSede(v);
                setSpaceId(null);
                resetSlot();
              }}
              options={[
                { value: 'coruna', label: SEDE_LABEL.coruna },
                { value: 'lugo', label: SEDE_LABEL.lugo },
              ]}
            />
            {sede !== me.sedeId && <p className="muted step-note">Tu sede de referencia es {SEDE_LABEL[me.sedeId]}, pero puedes reservar en las dos.</p>}
          </section>

          <section className="card" aria-labelledby="step-espacio">
            <h2 className="step-title" id="step-espacio">
              <span className="step-title__n">2</span> Espacio
            </h2>
            <div className="space-options">
              {spaces.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="space-option"
                  aria-pressed={s.id === spaceId}
                  onClick={() => {
                    setSpaceId(s.id);
                    resetSlot();
                  }}
                >
                  <strong className="space-option__name">{s.name}</strong>
                  <span className="space-option__meta">
                    <Users size={14} aria-hidden="true" />
                    {s.mode === 'jornada' ? `${s.units} puestos` : `Hasta ${s.capacity} personas`}
                  </span>
                  <span className="space-option__meta">
                    <Clock size={14} aria-hidden="true" />
                    {fmtRange(s.open, s.close)}
                  </span>
                  <span className="space-option__rate">{rateText(s)}</span>
                  {s.sedeId === 'lugo' && <span className="space-option__note">Nombre y tarifa provisionales</span>}
                </button>
              ))}
            </div>
          </section>

          <section className="card" aria-labelledby="step-fecha">
            <h2 className="step-title" id="step-fecha">
              <span className="step-title__n">3</span> Fecha
            </h2>
            <div className="day-strip">
              {days.map((d) => {
                const dt = fromISODate(d);
                return (
                  <button
                    key={d}
                    type="button"
                    className="day-chip"
                    aria-pressed={d === date}
                    aria-label={fmtDateLong(d)}
                    onClick={() => {
                      setDate(d);
                      resetSlot();
                    }}
                  >
                    <span className="day-chip__dow">{d === today ? 'Hoy' : dt.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</span>
                    <span className="day-chip__num">{dt.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <label className="date-other">
              <span className="field__label">Otra fecha</span>
              <input
                type="date"
                className="input"
                min={today}
                value={date}
                onChange={(e) => {
                  if (e.target.value && e.target.value >= today) {
                    setDate(e.target.value);
                    resetSlot();
                  }
                }}
              />
            </label>
          </section>

          <section className="card" aria-labelledby="step-hora">
            <h2 className="step-title" id="step-hora">
              <span className="step-title__n">4</span> {space?.mode === 'jornada' ? 'Jornada' : 'Hora'}
            </h2>

            {!space && <p className="muted">Elige primero un espacio para ver su disponibilidad.</p>}

            {space && space.mode === 'horas' && (
              <div className="stack">
                <p className="muted">
                  Disponibilidad de {space.name} el {fmtDateLong(date).toLowerCase()}. Elige la hora de inicio.
                </p>
                <div className="slot-grid">
                  {slots.map((m) => {
                    const busy = freeUnits(state, space.id, date, m, m + 60) === 0;
                    const past = isPast(m);
                    const inRange = range !== null && m >= range.start && m < range.end;
                    return (
                      <button
                        key={m}
                        type="button"
                        className={`slot ${inRange ? 'is-in-range' : ''} ${busy ? 'is-busy' : ''}`}
                        disabled={busy || past}
                        aria-pressed={m === start}
                        onClick={() => {
                          setStart(m);
                          setHours(1);
                          setError('');
                        }}
                      >
                        <span className="slot__time">{fmtTime(m)}</span>
                        {busy ? <span className="slot__state">Ocupada</span> : past ? <span className="slot__state">Pasada</span> : null}
                      </button>
                    );
                  })}
                </div>
                {start !== null && durations.length > 0 && (
                  <div className="duration">
                    <span className="field__label" id="duration-label">
                      Duración
                    </span>
                    <Segmented
                      label="Duración"
                      value={String(safeHours)}
                      onChange={(v) => setHours(Number(v))}
                      options={durations.map((h) => ({ value: String(h), label: `${h} h` }))}
                    />
                    {durations.length < MAX_HOURS && (
                      <span className="muted">
                        Máximo {durations.length} h desde las {fmtTime(start)}: después hay otra reserva o cierra el espacio.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {space && space.mode === 'jornada' && (
              <div className="stack">
                <p className="desk-free">
                  Quedan <strong>{deskFree}</strong> de {space.units} puestos el {fmtDateLong(date).toLowerCase()}
                </p>
                {deskMine ? (
                  <p className="muted">Ya tienes un puesto reservado este día. Lo encontrarás en Mis reservas.</p>
                ) : deskClosed ? (
                  <p className="muted">La jornada de hoy ya ha terminado. Elige otro día.</p>
                ) : deskFree === 0 ? (
                  <p className="muted">No quedan puestos libres este día. Prueba con otra fecha o con la otra sede.</p>
                ) : (
                  <div>
                    <button type="button" className="slot slot--day" aria-pressed={fullDay} onClick={() => setFullDay((v) => !v)}>
                      <span className="slot__time">Jornada completa</span>
                      <span className="slot__state">{fmtRange(space.open, space.close)}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="card book-summary" aria-labelledby="summary-title">
          <h2 className="card__title" id="summary-title">
            Tu reserva
          </h2>
          <dl className="detail">
            <dt>Espacio</dt>
            <dd>{space ? space.name : <span className="muted">Sin elegir</span>}</dd>
            <dt>Sede</dt>
            <dd>{SEDE_LABEL[sede]}</dd>
            <dt>Fecha</dt>
            <dd>{fmtDateLong(date)}</dd>
            <dt>Horario</dt>
            <dd>{range ? fmtRange(range.start, range.end) : <span className="muted">Sin elegir</span>}</dd>
            <dt>Importe</dt>
            <dd>{space && range ? priceLabel(priceFor(space, range.start, range.end, true)) : <span className="muted">—</span>}</dd>
          </dl>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button variant="primary" disabled={!space || !range} onClick={confirm}>
            Confirmar reserva
          </Button>
          {(!space || !range) && <p className="muted book-summary__hint">Elige espacio, fecha y hora para confirmar.</p>}
        </aside>
      </div>
    </>
  );
}
