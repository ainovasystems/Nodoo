import { CalendarPlus, ChevronRight, MessageSquare } from 'lucide-react';
import { fmtDateLong, fmtMoney, fmtRange, fmtRelativeDay, fmtStamp, toISODate } from '../../dates';
import { planById, spaceById } from '../../store';
import { Badge, BookingBadge, Card, EmptyState, MemberBadge, SEDE_LABEL, SedeTag, TicketBadge } from '../../ui';
import { byDateAsc, firstName, isUpcoming, type ViewProps } from '../helpers';

export function Inicio({ state, me, go }: ViewProps) {
  const upcoming = state.bookings
    .filter((b) => b.memberId === me.id && b.status !== 'cancelada' && isUpcoming(b))
    .sort(byDateAsc);
  const next = upcoming[0];
  const plan = planById(state, me.planId);
  const tickets = state.tickets.filter((t) => t.memberId === me.id).slice(0, 3);
  const now = new Date();
  const nextInvoice = toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 1));

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-head__title">Hola, {firstName(me.name)}</h1>
          <div className="cluster portal-greeting">
            <SedeTag sede={me.sedeId} />
            {plan && <Badge tone="info">{plan.name}</Badge>}
            {me.status !== 'activo' && <MemberBadge status={me.status} />}
          </div>
        </div>
      </header>

      <div className="home-grid">
        <div className="stack">
          {next ? (
            <section className="next-booking" aria-labelledby="next-booking-title">
              <p className="next-booking__label" id="next-booking-title">
                Tu próxima reserva
              </p>
              <p className="next-booking__space">{spaceById(state, next.spaceId).name}</p>
              <p className="next-booking__when">
                {fmtRelativeDay(next.date)}, {fmtRange(next.start, next.end)}
              </p>
              <div className="cluster next-booking__meta">
                <span>{fmtDateLong(next.date)}</span>
                <span>Sede de {SEDE_LABEL[next.sedeId]}</span>
                <BookingBadge status={next.status} />
              </div>
              <div className="cluster">
                <a className="btn btn--primary" href="#/reservas">
                  Ver mis reservas
                </a>
                {upcoming.length > 1 && (
                  <span className="next-booking__more">
                    y {upcoming.length - 1} {upcoming.length - 1 === 1 ? 'reserva más' : 'reservas más'} en agenda
                  </span>
                )}
              </div>
            </section>
          ) : (
            <Card>
              <EmptyState
                title="No tienes reservas próximas"
                action={
                  <a className="btn btn--primary" href="#/reservar">
                    Reservar un espacio
                  </a>
                }
              >
                Reserva una sala de reuniones o un puesto en cualquiera de las dos sedes.
              </EmptyState>
            </Card>
          )}

          <div className="quick-actions">
            <button type="button" className="quick-action" onClick={() => go('reservar')}>
              <CalendarPlus size={22} aria-hidden="true" />
              <span>
                <strong>Reservar un espacio</strong>
                <span className="muted">Salas y puestos en A Coruña y Lugo</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="quick-action" onClick={() => go('consultas/nueva')}>
              <MessageSquare size={22} aria-hidden="true" />
              <span>
                <strong>Abrir consulta</strong>
                <span className="muted">Te responde el equipo de tu sede</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <Card
            title="Últimas consultas"
            action={
              <a className="btn btn--quiet btn--sm" href="#/consultas">
                Ver todas
              </a>
            }
          >
            {tickets.length === 0 ? (
              <p className="muted">Aún no has abierto ninguna consulta.</p>
            ) : (
              <ul className="rows">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <div className="rows__main">
                      <p className="rows__title">{t.subject}</p>
                      <p className="rows__sub">
                        {t.category}, {fmtStamp(t.messages[t.messages.length - 1].at)}
                      </p>
                    </div>
                    <TicketBadge status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card
          title="Tu suscripción"
          action={
            <a className="btn btn--quiet btn--sm" href="#/suscripcion">
              Gestionar
            </a>
          }
        >
          {plan ? (
            <div className="stack">
              <div>
                <p className="plan-name">{plan.name}</p>
                <p className="plan-price">
                  {fmtMoney(plan.price)} <span>+ IVA/mes</span>
                </p>
              </div>
              <dl className="detail">
                <dt>Estado</dt>
                <dd>
                  <MemberBadge status={me.status} />
                </dd>
                <dt>Próxima factura</dt>
                <dd>{me.status === 'activo' ? fmtDateLong(nextInvoice) : 'Sin facturas mientras esté en pausa'}</dd>
                <dt>Sede</dt>
                <dd>{SEDE_LABEL[me.sedeId]}</dd>
              </dl>
              <p className="muted">Sin permanencia y sin matrícula.</p>
            </div>
          ) : (
            <EmptyState
              title="No tienes un plan mensual"
              action={
                <a className="btn btn--primary" href="#/suscripcion">
                  Ver planes
                </a>
              }
            >
              Reservas salas por horas. Con un plan tendrías tu puesto en The Hive.
            </EmptyState>
          )}
        </Card>
      </div>
    </>
  );
}

