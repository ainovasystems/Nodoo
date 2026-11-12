// Espacios de cada sede: capacidad, horario, tarifas y ocupación.

import { Card, PageHead, SEDE_LABEL, SedeTag } from '../../ui';
import { inSede, useDemo } from '../../store';
import { fmtMoney, fmtRange, todayISO } from '../../dates';
import { MeterList } from '../components/charts';
import { fmtPct, isActive, KIND_LABEL, occupancy, SEDE_ORDER, useSede, workWeek } from '../helpers';

export default function Espacios() {
  const s = useDemo();
  const sede = useSede();
  const today = todayISO();
  const week = workWeek(today);
  const sedes = SEDE_ORDER.filter((id) => sede === 'todas' || sede === id);

  return (
    <>
      <PageHead title="Espacios" subtitle="Lo que se puede reservar en cada sede. Tarifas sin IVA." />
      <div className="stack stack--loose">
        {sedes.map((id) => (
          <section key={id} aria-labelledby={`sede-${id}`}>
            <h2 className="section-title" id={`sede-${id}`}>
              <SedeTag sede={id} />
              <span className="visually-hidden">Espacios de {SEDE_LABEL[id]}</span>
            </h2>
            <div className="space-grid">
              {inSede(s.spaces, id).map((sp) => {
                const todays = s.bookings.filter((b) => b.spaceId === sp.id && b.date === today && isActive(b)).length;
                const o = occupancy(s, sp, week);
                const pool = sp.mode === 'jornada';
                return (
                  <Card key={sp.id} title={sp.name}>
                    <dl className="detail">
                      <dt>Tipo</dt>
                      <dd>{KIND_LABEL[sp.kind]}</dd>
                      <dt>Capacidad</dt>
                      <dd>{pool ? `${sp.units} puestos` : `${sp.capacity} personas`}</dd>
                      <dt>Horario</dt>
                      <dd>{fmtRange(sp.open, sp.close)}</dd>
                      <dt>Se reserva</dt>
                      <dd>{pool ? 'Por jornada completa' : 'Por horas'}</dd>
                      <dt>Tarifa miembros</dt>
                      <dd>{pool ? 'Incluido en el plan' : `${fmtMoney(sp.rateMember)}/h`}</dd>
                      <dt>Tarifa externos</dt>
                      <dd>{pool ? 'Incluido en el plan' : `${fmtMoney(sp.rateExternal)}/h`}</dd>
                      <dt>Reservas hoy</dt>
                      <dd>{pool ? `${todays} de ${sp.units} puestos` : todays}</dd>
                    </dl>
                    <div className="space-card__meter">
                      <MeterList
                        rows={[
                          {
                            id: sp.id,
                            name: 'Ocupación de la semana',
                            ratio: o.ratio,
                            figure: fmtPct(o.ratio),
                            detail: pool ? `${o.used} de ${o.total} jornadas de puesto reservadas` : `${String(o.used).replace('.', ',')} h reservadas de ${o.total} h abiertas`,
                          },
                        ]}
                      />
                    </div>
                    {id === 'lugo' && <p className="note">Nombre y tarifas provisionales.</p>}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
