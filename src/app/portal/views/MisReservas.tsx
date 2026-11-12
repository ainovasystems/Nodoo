import { useState } from 'react';
import { fmtDateLong, fmtRange } from '../../dates';
import { setBookingStatus, spaceById } from '../../store';
import { BookingBadge, Button, Card, EmptyState, Modal, PageHead, SedeTag, Segmented, useToast } from '../../ui';
import type { Booking } from '../../types';
import { byDateAsc, byDateDesc, isUpcoming, priceLabel, type ViewProps } from '../helpers';

type Tab = 'proximas' | 'pasadas' | 'canceladas';

export function MisReservas({ state, me }: ViewProps) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('proximas');
  const [toCancel, setToCancel] = useState<Booking | null>(null);

  const mine = state.bookings.filter((b) => b.memberId === me.id);
  const lists: Record<Tab, Booking[]> = {
    proximas: mine.filter((b) => b.status !== 'cancelada' && isUpcoming(b)).sort(byDateAsc),
    pasadas: mine.filter((b) => b.status !== 'cancelada' && !isUpcoming(b)).sort(byDateDesc),
    canceladas: mine.filter((b) => b.status === 'cancelada').sort(byDateDesc),
  };
  const list = lists[tab];

  const cancel = () => {
    if (!toCancel) return;
    setBookingStatus(toCancel.id, 'cancelada');
    setToCancel(null);
    toast('Reserva cancelada');
  };

  return (
    <>
      <PageHead title="Mis reservas" subtitle="Tus reservas de salas y puestos en las dos sedes.">
        <a className="btn btn--primary" href="#/reservar">
          Reservar un espacio
        </a>
      </PageHead>

      <div className="tabs-row">
        <Segmented
          label="Filtrar reservas"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'proximas', label: `Próximas (${lists.proximas.length})` },
            { value: 'pasadas', label: `Pasadas (${lists.pasadas.length})` },
            { value: 'canceladas', label: `Canceladas (${lists.canceladas.length})` },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <Card>
          {tab === 'proximas' && (
            <EmptyState
              title="No tienes reservas próximas"
              action={
                <a className="btn btn--primary" href="#/reservar">
                  Reservar un espacio
                </a>
              }
            >
              Cuando reserves una sala o un puesto, aparecerá aquí.
            </EmptyState>
          )}
          {tab === 'pasadas' && <EmptyState title="Todavía no hay reservas pasadas">Aquí verás el historial de los espacios que has usado.</EmptyState>}
          {tab === 'canceladas' && <EmptyState title="No has cancelado ninguna reserva">Las reservas que canceles quedarán registradas aquí.</EmptyState>}
        </Card>
      ) : (
        <ul className="booking-list">
          {list.map((b) => {
            const space = spaceById(state, b.spaceId);
            return (
              <li key={b.id}>
                <Card className="booking-item">
                <div className="booking-item__main">
                  <p className="booking-item__space">{space.name}</p>
                  <p className="booking-item__when">
                    {fmtDateLong(b.date)}, {space.mode === 'jornada' ? 'jornada completa' : fmtRange(b.start, b.end)}
                  </p>
                  <div className="cluster">
                    <SedeTag sede={b.sedeId} />
                    <span className="muted">{priceLabel(b.price)}</span>
                  </div>
                </div>
                <div className="booking-item__side">
                  <BookingBadge status={b.status} />
                  {tab === 'proximas' && (
                    <Button variant="danger" size="sm" onClick={() => setToCancel(b)}>
                      Cancelar reserva
                    </Button>
                  )}
                </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={toCancel !== null}
        onClose={() => setToCancel(null)}
        title="Cancelar reserva"
        footer={
          <>
            <Button onClick={() => setToCancel(null)}>Mantener reserva</Button>
            <Button variant="danger" onClick={cancel}>
              Cancelar reserva
            </Button>
          </>
        }
      >
        {toCancel && (
          <p>
            Vas a cancelar <strong>{spaceById(state, toCancel.spaceId).name}</strong> el {fmtDateLong(toCancel.date).toLowerCase()},{' '}
            {fmtRange(toCancel.start, toCancel.end)}. La franja quedará libre para otros miembros.
          </p>
        )}
      </Modal>
    </>
  );
}
