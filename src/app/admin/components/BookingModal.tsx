// Formulario "Nueva reserva". Se abre desde el calendario y desde la
// lista de reservas, con el espacio, la fecha y la hora que vengan dados.

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button, Field, Modal, Segmented, SEDE_LABEL, useToast } from '../../ui';
import { createBooking, priceFor, useDemo } from '../../store';
import { fmtTime, todayISO } from '../../dates';
import type { SedeId } from '../../types';
import { SEDE_ORDER, useSede } from '../helpers';

export interface BookingDraft {
  spaceId?: string;
  date?: string;
  start?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  draft?: BookingDraft;
}

export default function BookingModal({ open, onClose, draft }: Props) {
  const s = useDemo();
  const sedeFilter = useSede();
  const toast = useToast();

  const [sedeId, setSedeId] = useState<SedeId>('coruna');
  const [spaceId, setSpaceId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [start, setStart] = useState(600);
  const [end, setEnd] = useState(660);
  const [who, setWho] = useState<'miembro' | 'externo'>('miembro');
  const [memberId, setMemberId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');
  const [priceEdited, setPriceEdited] = useState(false);
  const [error, setError] = useState('');

  // Cada apertura parte del borrador recibido.
  useEffect(() => {
    if (!open) return;
    const fromDraft = draft?.spaceId ? s.spaces.find((x) => x.id === draft.spaceId) : undefined;
    const sede: SedeId = fromDraft?.sedeId ?? (sedeFilter === 'todas' ? 'coruna' : sedeFilter);
    const space = fromDraft ?? s.spaces.find((x) => x.sedeId === sede)!;
    const st = Math.min(Math.max(draft?.start ?? 600, space.open), space.close - 60);
    setSedeId(sede);
    setSpaceId(space.id);
    setDate(draft?.date ?? todayISO());
    setStart(st);
    setEnd(st + 60);
    setWho('miembro');
    setMemberId('');
    setGuestName('');
    setNotes('');
    setPriceEdited(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const spaces = s.spaces.filter((x) => x.sedeId === sedeId);
  const space = spaces.find((x) => x.id === spaceId) ?? spaces[0];
  const members = s.members.filter((m) => m.sedeId === sedeId && m.status === 'activo');
  const byDay = space?.mode === 'jornada';

  const hours = useMemo(() => {
    if (!space) return [];
    const out: number[] = [];
    for (let m = space.open; m <= space.close; m += 60) out.push(m);
    return out;
  }, [space]);

  const effStart = byDay ? space.open : start;
  const effEnd = byDay ? space.close : end;
  const computed = space ? priceFor(space, effStart, effEnd, who === 'miembro') : 0;

  useEffect(() => {
    if (!priceEdited) setPrice(String(computed));
  }, [computed, priceEdited]);

  const changeSede = (id: SedeId) => {
    setSedeId(id);
    const first = s.spaces.find((x) => x.sedeId === id)!;
    changeSpace(first.id);
    setMemberId('');
  };

  const changeSpace = (id: string) => {
    const sp = s.spaces.find((x) => x.id === id)!;
    setSpaceId(id);
    const st = Math.min(Math.max(start, sp.open), sp.close - 60);
    setStart(st);
    setEnd(Math.min(Math.max(end, st + 60), sp.close));
  };

  const changeStart = (v: number) => {
    setStart(v);
    if (end <= v) setEnd(v + 60);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (who === 'miembro' && !memberId) return setError('Elige el miembro que hace la reserva.');
    if (who === 'externo' && !guestName.trim()) return setError('Escribe el nombre del cliente externo.');
    const parsed = Number(String(price).replace(',', '.'));
    const res = createBooking({
      spaceId: space.id,
      memberId: who === 'miembro' ? memberId : null,
      guestName: who === 'externo' ? guestName.trim() : undefined,
      date,
      start: effStart,
      end: effEnd,
      source: 'panel',
      notes: notes.trim() || undefined,
      price: Number.isFinite(parsed) && parsed >= 0 ? parsed : computed,
    });
    if (!res.ok) return setError(res.error);
    toast('Reserva creada');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva reserva"
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Descartar
          </Button>
          <Button variant="primary" type="submit" form="booking-form">
            Crear reserva
          </Button>
        </>
      }
    >
      {space && (
        <form id="booking-form" className="stack" onSubmit={submit} noValidate>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-grid form-grid--2">
            <Field label="Sede">
              {(id) => (
                <select id={id} className="select" value={sedeId} onChange={(e) => changeSede(e.target.value as SedeId)}>
                  {SEDE_ORDER.map((sd) => (
                    <option key={sd} value={sd}>
                      {SEDE_LABEL[sd]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Espacio">
              {(id) => (
                <select id={id} className="select" value={space.id} onChange={(e) => changeSpace(e.target.value)}>
                  {spaces.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <Field label="Fecha">
            {(id) => <input id={id} type="date" className="input" value={date} required onChange={(e) => e.target.value && setDate(e.target.value)} />}
          </Field>

          {byDay ? (
            <p className="muted">
              Los puestos se reservan por jornada completa: de {fmtTime(space.open)} a {fmtTime(space.close)}.
            </p>
          ) : (
            <div className="form-grid form-grid--2">
              <Field label="Inicio">
                {(id) => (
                  <select id={id} className="select" value={start} onChange={(e) => changeStart(Number(e.target.value))}>
                    {hours.slice(0, -1).map((h) => (
                      <option key={h} value={h}>
                        {fmtTime(h)}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Fin">
                {(id) => (
                  <select id={id} className="select" value={end} onChange={(e) => setEnd(Number(e.target.value))}>
                    {hours
                      .filter((h) => h > start)
                      .map((h) => (
                        <option key={h} value={h}>
                          {fmtTime(h)}
                        </option>
                      ))}
                  </select>
                )}
              </Field>
            </div>
          )}

          <div className="stack stack--tight">
            <Segmented
              label="Tipo de cliente"
              value={who}
              onChange={setWho}
              options={[
                { value: 'miembro', label: 'Miembro' },
                { value: 'externo', label: 'Cliente externo' },
              ]}
            />
            {who === 'miembro' ? (
              <Field label="Miembro" hint={`Miembros activos de ${SEDE_LABEL[sedeId]}.`}>
                {(id) => (
                  <select id={id} className="select" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                    <option value="">Elige un miembro</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {m.company}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            ) : (
              <Field label="Nombre del cliente o empresa">
                {(id) => <input id={id} className="input" value={guestName} onChange={(e) => setGuestName(e.target.value)} />}
              </Field>
            )}
          </div>

          <Field label="Importe (€, sin IVA)" hint={priceEdited ? 'Importe ajustado a mano.' : 'Calculado con la tarifa del espacio. Puedes ajustarlo.'}>
            {(id) => (
              <input
                id={id}
                className="input"
                type="number"
                min="0"
                step="0.5"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setPriceEdited(true);
                }}
              />
            )}
          </Field>

          <Field label="Notas internas">
            {(id) => <textarea id={id} className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />}
          </Field>
        </form>
      )}
    </Modal>
  );
}
