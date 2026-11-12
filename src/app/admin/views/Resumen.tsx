// Resumen: lo que el equipo necesita ver al empezar el día.

import { BookingBadge, Button, Card, EmptyState, PageHead, SedeTag, Stat, TicketBadge } from '../../ui';
import { bookingWho, inSede, memberById, monthlyRecurring, spaceById, useDemo } from '../../store';
import { fmtDateLong, fmtHours, fmtMoney, fmtRange, fmtRelativeDay, shiftISO, todayISO } from '../../dates';
import { ColumnChart, MeterList } from '../components/charts';
import { fmtPct, isActive, occupancy, useSede, weekdayShort, workWeek } from '../helpers';

export default function Resumen({ go }: { go: (route: string) => void }) {
  const s = useDemo();
  const sede = useSede();
  const today = todayISO();
  const week = workWeek(today);

  const spaces = inSede(s.spaces, sede);
  const bookings = inSede(s.bookings, sede).filter(isActive);
  const isPool = (spaceId: string) => spaceById(s, spaceId).mode === 'jornada';
  // Primero las salas por hora; después, los puestos de jornada completa.
  const todays = bookings
    .filter((b) => b.date === today)
    .sort((a, b) => Number(isPool(a.spaceId)) - Number(isPool(b.spaceId)) || a.start - b.start);

  const rooms = spaces.filter((sp) => sp.mode === 'horas');
  const roomOcc = rooms.map((sp) => occupancy(s, sp, week));
  const roomRatio = roomOcc.reduce((a, o) => a + o.used, 0) / Math.max(1, roomOcc.reduce((a, o) => a + o.total, 0));

  const openLeads = inSede(s.leads, sede).filter((l) => l.stage !== 'ganado' && l.stage !== 'perdido');
  const due = openLeads
    .filter((l) => l.nextAction && l.nextAction.date <= today)
    .sort((a, b) => a.nextAction!.date.localeCompare(b.nextAction!.date));
  const openTickets = inSede(s.tickets, sede).filter((t) => t.status !== 'resuelta');
  const activeMembers = inSede(s.members, sede).filter((m) => m.status === 'activo' && m.planId).length;

  const next7 = Array.from({ length: 7 }, (_, i) => shiftISO(today, i));

  return (
    <>
      <PageHead title="Resumen" subtitle={fmtDateLong(today)}>
        <Button variant="primary" onClick={() => go('calendario')}>
          Abrir el calendario
        </Button>
      </PageHead>

      <div className="stat-grid">
        <Stat label="Reservas hoy" value={todays.length} hint={`${todays.filter((b) => b.status === 'pendiente').length} pendientes de confirmar`} tone="accent" />
        <Stat label="Ocupación de salas esta semana" value={fmtPct(roomRatio)} hint="Horas reservadas sobre horas abiertas, de lunes a sábado" />
        <Stat label="Ingresos recurrentes al mes" value={fmtMoney(monthlyRecurring(s, sede))} hint={`${activeMembers} miembros con plan activo · sin IVA`} />
        <Stat label="Leads abiertos" value={openLeads.length} hint={due.length ? `${due.length} con seguimiento para hoy o vencido` : 'Ningún seguimiento pendiente hoy'} />
      </div>

      <div className="dash-grid">
        <Card title="Agenda de hoy" action={<Button size="sm" variant="quiet" onClick={() => go('reservas')}>Ver todas las reservas</Button>}>
          {todays.length === 0 ? (
            <EmptyState title="No hay reservas para hoy">Crea una desde el calendario haciendo clic en un hueco libre.</EmptyState>
          ) : (
            <ul className="rows">
              {todays.map((b) => {
                const sp = spaceById(s, b.spaceId);
                return (
                  <li key={b.id}>
                    <span className="agenda-time">{sp.mode === 'jornada' ? 'Jornada' : fmtRange(b.start, b.end)}</span>
                    <div className="rows__main">
                      <p className="rows__title">{bookingWho(s, b)}</p>
                      <p className="rows__sub">
                        {sp.name}
                        {sede === 'todas' && <> · <SedeTag sede={b.sedeId} /></>}
                      </p>
                    </div>
                    <BookingBadge status={b.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="stack">
          <Card title="Seguimientos pendientes" action={<Button size="sm" variant="quiet" onClick={() => go('leads')}>Ir a leads</Button>}>
            {due.length === 0 ? (
              <EmptyState title="Todo al día">No hay leads con seguimiento para hoy ni vencido.</EmptyState>
            ) : (
              <ul className="rows">
                {due.map((l) => (
                  <li key={l.id}>
                    <div className="rows__main">
                      <p className="rows__title">{l.name}</p>
                      <p className="rows__sub">{l.nextAction!.text}</p>
                    </div>
                    <span className={`due ${l.nextAction!.date < today ? 'due--late' : ''}`}>
                      {l.nextAction!.date < today ? `Vencido · ${fmtRelativeDay(l.nextAction!.date)}` : 'Hoy'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Consultas abiertas" action={<Button size="sm" variant="quiet" onClick={() => go('consultas')}>Ir a consultas</Button>}>
            {openTickets.length === 0 ? (
              <EmptyState title="Sin consultas abiertas">Las consultas que abran los miembros desde su portal aparecerán aquí.</EmptyState>
            ) : (
              <ul className="rows">
                {openTickets.map((t) => (
                  <li key={t.id}>
                    <div className="rows__main">
                      <p className="rows__title">{t.subject}</p>
                      <p className="rows__sub">
                        {memberById(s, t.memberId)?.name} · {t.category}
                      </p>
                    </div>
                    <TicketBadge status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Ocupación por espacio, esta semana">
          <p className="chart-note">Salas: horas reservadas sobre horas abiertas. Puestos: jornadas reservadas sobre puestos disponibles. De lunes a sábado.</p>
          <MeterList
            rows={spaces.map((sp) => {
              const o = occupancy(s, sp, week);
              return {
                id: sp.id,
                name: (
                  <>
                    {sp.name}
                    {sede === 'todas' && <SedeTag sede={sp.sedeId} />}
                  </>
                ),
                ratio: o.ratio,
                figure: fmtPct(o.ratio),
                detail: sp.mode === 'jornada' ? `${o.used} de ${o.total} jornadas de puesto reservadas` : `${fmtHours(o.used)} reservadas de ${fmtHours(o.total)} abiertas`,
              };
            })}
          />
        </Card>

        <Card title="Reservas por día, próximos 7 días">
          <p className="chart-note">Reservas confirmadas y pendientes, salas y puestos.</p>
          <ColumnChart
            unit="reservas por día"
            data={next7.map((d) => {
              const n = bookings.filter((b) => b.date === d).length;
              return {
                id: d,
                label: d === today ? 'Hoy' : weekdayShort(d),
                sublabel: String(Number(d.slice(8))),
                value: n,
                current: d === today,
                detail: `${fmtDateLong(d)}: ${n} ${n === 1 ? 'reserva' : 'reservas'}`,
              };
            })}
          />
        </Card>
      </div>
    </>
  );
}
