// Detalle de una reserva, con las acciones de confirmar y cancelar.
// Cancelar pide confirmación en el mismo diálogo antes de ejecutarse.

import { useEffect, useState } from 'react';
import { BookingBadge, Button, Modal, SedeTag, useToast } from '../../ui';
import { bookingWho, memberById, setBookingStatus, spaceById, useDemo } from '../../store';
import { fmtDateLong, fmtMoney, fmtRange, fmtStamp } from '../../dates';
import { SOURCE_LABEL } from '../helpers';

export default function BookingDetail({ bookingId, onClose }: { bookingId: string | null; onClose: () => void }) {
  const s = useDemo();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const b = bookingId ? s.bookings.find((x) => x.id === bookingId) : undefined;
  const space = b ? spaceById(s, b.spaceId) : undefined;
  const member = b ? memberById(s, b.memberId) : undefined;

  useEffect(() => setConfirming(false), [bookingId]);

  // En mitad de frase, el día va en minúscula: "jueves, 12 de noviembre".
  const day = b ? fmtDateLong(b.date) : '';
  const when = b && space ? `${day.charAt(0).toLowerCase()}${day.slice(1)}${space.mode === 'jornada' ? '' : `, ${fmtRange(b.start, b.end)}`}` : '';

  return (
    <Modal
      open={Boolean(b)}
      onClose={onClose}
      title={confirming ? 'Cancelar la reserva' : 'Detalle de la reserva'}
      footer={
        b &&
        (confirming ? (
          <>
            <Button variant="quiet" onClick={() => setConfirming(false)}>
              Mantener reserva
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setBookingStatus(b.id, 'cancelada');
                toast('Reserva cancelada');
                onClose();
              }}
            >
              Sí, cancelar reserva
            </Button>
          </>
        ) : (
          <>
            {b.status !== 'cancelada' && (
              <Button variant="danger" onClick={() => setConfirming(true)}>
                Cancelar reserva
              </Button>
            )}
            {b.status === 'pendiente' && (
              <Button
                variant="primary"
                onClick={() => {
                  setBookingStatus(b.id, 'confirmada');
                  toast('Reserva confirmada');
                  onClose();
                }}
              >
                Confirmar reserva
              </Button>
            )}
            {b.status !== 'pendiente' && (
              <Button variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
            )}
          </>
        ))
      }
    >
      {b && space && confirming && (
        <div className="stack">
          <p>
            Vas a cancelar la reserva de <strong>{space.name}</strong> de <strong>{bookingWho(s, b)}</strong> ({when}).
          </p>
          <p className="muted">La franja queda libre para otras reservas. La reserva sigue en el listado como cancelada.</p>
        </div>
      )}
      {b && space && !confirming && (
        <div className="stack">
          <div className="cluster">
            <BookingBadge status={b.status} />
            <SedeTag sede={b.sedeId} />
          </div>
          <dl className="detail">
            <dt>Espacio</dt>
            <dd>{space.name}</dd>
            <dt>Fecha</dt>
            <dd>{fmtDateLong(b.date)}</dd>
            <dt>Horario</dt>
            <dd>{space.mode === 'jornada' ? 'Jornada completa' : fmtRange(b.start, b.end)}</dd>
            <dt>Cliente</dt>
            <dd>
              {bookingWho(s, b)}
              <span className="muted"> · {member ? `Miembro, ${member.company}` : 'Externo'}</span>
            </dd>
            <dt>Importe</dt>
            <dd>{b.price > 0 ? `${fmtMoney(b.price)} sin IVA` : 'Incluido en el plan'}</dd>
            <dt>Origen</dt>
            <dd>
              {SOURCE_LABEL[b.source]} · creada el {fmtStamp(b.createdAt)}
            </dd>
            {b.notes && (
              <>
                <dt>Notas</dt>
                <dd>{b.notes}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </Modal>
  );
}
