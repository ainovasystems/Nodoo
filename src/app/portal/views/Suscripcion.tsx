import { useState } from 'react';
import { Check } from 'lucide-react';
import { PLANES } from '@/data/site';
import { fmtDateLong, fmtDateNum, fmtMoney, toISODate } from '../../dates';
import { planById, updateMember } from '../../store';
import { Badge, Button, Card, EmptyState, InvoiceBadge, MemberBadge, Modal, PageHead, useToast } from '../../ui';
import type { Plan } from '../../types';
import type { ViewProps } from '../helpers';

/** Planes que el miembro puede contratar por su cuenta. */
const SELF_SERVICE = ['hive-basic', 'hive-plus'];

function featuresOf(plan: Plan): string[] {
  const known = PLANES.find((p) => p.id === plan.id);
  return known ? [...known.features] : [plan.description];
}

export function Suscripcion({ state, me }: ViewProps) {
  const toast = useToast();
  const [target, setTarget] = useState<Plan | null>(null);
  const [confirmPause, setConfirmPause] = useState(false);

  const plan = planById(state, me.planId);
  const options = state.plans.filter((p) => SELF_SERVICE.includes(p.id));
  const invoices = state.invoices.filter((i) => i.memberId === me.id).sort((a, b) => b.date.localeCompare(a.date));
  const now = new Date();
  const firstOfNext = fmtDateLong(toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 1))).toLowerCase();
  const paused = me.status === 'pausado';

  const changePlan = () => {
    if (!target) return;
    updateMember(me.id, { planId: target.id, status: me.status === 'baja' ? 'activo' : me.status });
    setTarget(null);
    toast('Plan actualizado. El cambio se aplica el día 1 del mes siguiente.');
  };

  const togglePause = () => {
    updateMember(me.id, { status: paused ? 'activo' : 'pausado' });
    setConfirmPause(false);
    toast(paused ? 'Suscripción reactivada' : 'Suscripción en pausa');
  };

  return (
    <>
      <PageHead title="Suscripción" subtitle="Tu plan, tus facturas y los cambios que puedes hacer por tu cuenta." />

      <div className="stack">
        <Card title="Tu plan">
          {plan ? (
            <div className="current-plan">
              <div className="stack">
                <div>
                  <div className="cluster">
                    <p className="plan-name">{plan.name}</p>
                    <MemberBadge status={me.status} />
                  </div>
                  <p className="plan-price">
                    {fmtMoney(plan.price)} <span>+ IVA/mes</span>
                  </p>
                </div>
                <ul className="check-list">
                  {featuresOf(plan).map((f) => (
                    <li key={f}>
                      <Check size={16} aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="muted">Sin permanencia · Sin matrícula</p>
              </div>
              <div className="current-plan__side">
                <p className="muted">
                  {paused
                    ? 'Tu suscripción está en pausa. No se emiten facturas hasta que la reactives.'
                    : `Próxima factura: ${firstOfNext}.`}
                </p>
                <Button onClick={() => setConfirmPause(true)}>{paused ? 'Reactivar suscripción' : 'Pausar suscripción'}</Button>
              </div>
            </div>
          ) : (
            <EmptyState title="No tienes un plan mensual">Elige uno de los planes de The Hive para tener tu puesto de trabajo.</EmptyState>
          )}
        </Card>

        <Card title="Cambiar de plan">
          <div className="plan-options">
            {options.map((p) => {
              const current = p.id === me.planId;
              return (
                <article key={p.id} className={`plan-option ${current ? 'is-current' : ''}`}>
                  <div className="cluster">
                    <h3 className="plan-option__name">{p.name}</h3>
                    {current && <Badge tone="accent">Tu plan actual</Badge>}
                  </div>
                  <p className="plan-price">
                    {fmtMoney(p.price)} <span>+ IVA/mes</span>
                  </p>
                  <ul className="check-list">
                    {featuresOf(p).map((f) => (
                      <li key={f}>
                        <Check size={16} aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={current ? 'ghost' : 'dark'} disabled={current} onClick={() => setTarget(p)}>
                    {current ? 'Plan actual' : 'Cambiar a este plan'}
                  </Button>
                </article>
              );
            })}
          </div>
          <p className="muted plan-options__note">
            ¿Te interesa The Office u otra modalidad? <a href="#/consultas/nueva">Abre una consulta</a> y el equipo te prepara una propuesta.
          </p>
        </Card>

        <Card title="Facturas" flush>
          {invoices.length === 0 ? (
            <EmptyState title="Aún no tienes facturas">La primera se emite el día 1 del mes siguiente a tu alta.</EmptyState>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th className="num">Importe sin IVA</th>
                    <th>Estado</th>
                    <th aria-label="Descarga" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id}>
                      <td>{i.number}</td>
                      <td>{fmtDateNum(i.date)}</td>
                      <td>{i.concept}</td>
                      <td className="num">{fmtMoney(i.amount)}</td>
                      <td>
                        <InvoiceBadge status={i.status} />
                      </td>
                      <td className="num">
                        <Button size="sm" variant="quiet" disabled title="No disponible en la demo">
                          Descargar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title="Cambiar de plan"
        footer={
          <>
            <Button onClick={() => setTarget(null)}>Seguir con mi plan</Button>
            <Button variant="primary" onClick={changePlan}>
              Cambiar a {target?.name}
            </Button>
          </>
        }
      >
        {target && (
          <p>
            Pasarás {plan ? `de ${plan.name} ` : ''}a <strong>{target.name}</strong> por {fmtMoney(target.price)} + IVA al mes. El cambio se aplica el {firstOfNext}.
          </p>
        )}
      </Modal>

      <Modal
        open={confirmPause}
        onClose={() => setConfirmPause(false)}
        title={paused ? 'Reactivar suscripción' : 'Pausar suscripción'}
        footer={
          <>
            <Button onClick={() => setConfirmPause(false)}>Volver</Button>
            <Button variant="primary" onClick={togglePause}>
              {paused ? 'Reactivar suscripción' : 'Pausar suscripción'}
            </Button>
          </>
        }
      >
        <p>
          {paused
            ? 'Tu plan vuelve a estar activo y se retoma la facturación mensual.'
            : 'Mientras esté en pausa no se emiten facturas y tu puesto queda libre. Puedes reactivarla cuando quieras desde aquí.'}
        </p>
      </Modal>
    </>
  );
}
