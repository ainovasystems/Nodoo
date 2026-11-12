// Clientes: miembros de las dos sedes, con su ficha completa.

import { useMemo, useState } from 'react';
import { Avatar, BookingBadge, Card, Drawer, EmptyState, Field, InvoiceBadge, MemberBadge, PageHead, SedeTag, TicketBadge, useToast } from '../../ui';
import { inSede, planById, spaceById, updateMember, useDemo } from '../../store';
import { fmtDateNum, fmtMoney, fmtRange, fmtRelativeDay, todayISO } from '../../dates';
import type { MemberStatus } from '../../types';
import { byWhen, isActive, useSede } from '../helpers';

function MemberDrawer({ memberId, onClose }: { memberId: string | null; onClose: () => void }) {
  const s = useDemo();
  const toast = useToast();
  const today = todayISO();
  const m = memberId ? s.members.find((x) => x.id === memberId) : undefined;
  if (!m) return <Drawer open={false} onClose={onClose} title="Cliente">{null}</Drawer>;

  const upcoming = s.bookings.filter((b) => b.memberId === m.id && b.date >= today && isActive(b)).sort(byWhen);
  const invoices = s.invoices.filter((i) => i.memberId === m.id).sort((a, b) => b.date.localeCompare(a.date));
  const tickets = s.tickets.filter((t) => t.memberId === m.id);

  return (
    <Drawer open onClose={onClose} title={m.name}>
      <div className="stack stack--loose">
        <div className="member-head">
          <Avatar name={m.name} size="lg" />
          <div>
            <p className="member-head__company">{m.company}</p>
            <div className="cluster">
              <MemberBadge status={m.status} />
              <SedeTag sede={m.sedeId} />
            </div>
          </div>
        </div>

        <dl className="detail">
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${m.email}`}>{m.email}</a>
          </dd>
          <dt>Teléfono</dt>
          <dd>{m.phone}</dd>
          <dt>Miembro desde</dt>
          <dd>{fmtDateNum(m.since)}</dd>
        </dl>

        <div className="form-grid form-grid--2">
          <Field label="Plan">
            {(id) => (
              <select
                id={id}
                className="select"
                value={m.planId ?? ''}
                onChange={(e) => {
                  updateMember(m.id, { planId: e.target.value || null });
                  toast('Plan actualizado');
                }}
              >
                <option value="">Sin plan (cliente puntual)</option>
                {s.plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {fmtMoney(p.price)}/mes
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Estado">
            {(id) => (
              <select
                id={id}
                className="select"
                value={m.status}
                onChange={(e) => {
                  updateMember(m.id, { status: e.target.value as MemberStatus });
                  toast('Estado actualizado');
                }}
              >
                <option value="activo">Activo</option>
                <option value="pausado">En pausa</option>
                <option value="baja">Baja</option>
              </select>
            )}
          </Field>
        </div>

        <section className="stack stack--tight">
          <h3 className="sub-title">Próximas reservas</h3>
          {upcoming.length === 0 ? (
            <p className="muted">No tiene reservas próximas.</p>
          ) : (
            <ul className="rows">
              {upcoming.slice(0, 6).map((b) => {
                const sp = spaceById(s, b.spaceId);
                return (
                  <li key={b.id}>
                    <div className="rows__main">
                      <p className="rows__title">{sp.name}</p>
                      <p className="rows__sub">
                        {fmtRelativeDay(b.date)} · {sp.mode === 'jornada' ? 'Jornada completa' : fmtRange(b.start, b.end)}
                      </p>
                    </div>
                    <BookingBadge status={b.status} />
                  </li>
                );
              })}
            </ul>
          )}
          {upcoming.length > 6 && <p className="muted">Y {upcoming.length - 6} más.</p>}
        </section>

        <section className="stack stack--tight">
          <h3 className="sub-title">Facturas</h3>
          {invoices.length === 0 ? (
            <p className="muted">Sin facturas emitidas.</p>
          ) : (
            <ul className="rows">
              {invoices.map((i) => (
                <li key={i.id}>
                  <div className="rows__main">
                    <p className="rows__title">{i.concept}</p>
                    <p className="rows__sub">
                      {i.number} · {fmtMoney(i.amount)} sin IVA
                    </p>
                  </div>
                  <InvoiceBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="stack stack--tight">
          <h3 className="sub-title">Consultas</h3>
          {tickets.length === 0 ? (
            <p className="muted">No ha abierto ninguna consulta.</p>
          ) : (
            <ul className="rows">
              {tickets.map((t) => (
                <li key={t.id}>
                  <div className="rows__main">
                    <p className="rows__title">{t.subject}</p>
                    <p className="rows__sub">{t.category}</p>
                  </div>
                  <TicketBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Drawer>
  );
}

export default function Clientes() {
  const s = useDemo();
  const sede = useSede();
  const today = todayISO();
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState<MemberStatus | ''>('');
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inSede(s.members, sede)
      .filter((m) => {
        if (status && m.status !== status) return false;
        if (plan === 'none' ? m.planId !== null : plan && m.planId !== plan) return false;
        if (q && !`${m.name} ${m.company} ${m.email}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [s.members, sede, query, plan, status]);

  const activeCount = inSede(s.members, sede).filter((m) => m.status === 'activo').length;

  return (
    <>
      <PageHead title="Clientes" subtitle={`${activeCount} miembros activos`} />

      <div className="toolbar">
        <div className="toolbar__field toolbar__field--grow">
          <Field label="Buscar">{(id) => <input id={id} type="search" className="input" value={query} placeholder="Nombre, empresa o email" onChange={(e) => setQuery(e.target.value)} />}</Field>
        </div>
        <div className="toolbar__field">
          <Field label="Plan">
            {(id) => (
              <select id={id} className="select" value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option value="">Todos</option>
                {s.plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value="none">Sin plan</option>
              </select>
            )}
          </Field>
        </div>
        <div className="toolbar__field">
          <Field label="Estado">
            {(id) => (
              <select id={id} className="select" value={status} onChange={(e) => setStatus(e.target.value as MemberStatus | '')}>
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="pausado">En pausa</option>
                <option value="baja">Baja</option>
              </select>
            )}
          </Field>
        </div>
      </div>

      <Card flush>
        {rows.length === 0 ? (
          <EmptyState title="Ningún cliente coincide con la búsqueda">Prueba con otro nombre o quita los filtros de plan y estado.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Sede</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Alta</th>
                  <th className="num">Reservas próximas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const p = planById(s, m.planId);
                  const next = s.bookings.filter((b) => b.memberId === m.id && b.date >= today && isActive(b)).length;
                  return (
                    <tr key={m.id} className="is-clickable" onClick={() => setOpen(m.id)}>
                      <td>
                        <div className="cell-person">
                          <Avatar name={m.name} />
                          <div>
                            <button type="button" className="row-link cell-person__name" onClick={(e) => { e.stopPropagation(); setOpen(m.id); }}>
                              {m.name}
                            </button>
                            <p className="cell-person__sub">{m.company}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <SedeTag sede={m.sedeId} />
                      </td>
                      <td>{p ? <>{p.name} <span className="muted">· {fmtMoney(p.price)}/mes</span></> : <span className="muted">Sin plan</span>}</td>
                      <td>
                        <MemberBadge status={m.status} />
                      </td>
                      <td className="nowrap">{fmtDateNum(m.since)}</td>
                      <td className="num">{next}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <MemberDrawer memberId={open} onClose={() => setOpen(null)} />
    </>
  );
}
