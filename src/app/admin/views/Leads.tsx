// Leads: embudo comercial en tablero o lista, con ficha de seguimiento.

import { useEffect, useState, type DragEvent, type FormEvent } from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import { Button, Card, Drawer, EmptyState, Field, Modal, PageHead, SEDE_LABEL, SedeTag, Segmented, StageBadge, useToast } from '../../ui';
import { addLeadNote, convertLead, createLead, inSede, moveLead, updateLead, useDemo } from '../../store';
import { fmtDateNum, fmtMoney, fmtRelativeDay, fmtStamp, todayISO } from '../../dates';
import { LEAD_STAGES, type Lead, type LeadStage, type SedeId } from '../../types';
import { SEDE_ORDER, useSede } from '../helpers';

const OWNERS = ['Sin asignar', 'Sergio', 'Marta'];
const SOURCES: Lead['source'][] = ['Web', 'Google', 'Instagram', 'LinkedIn', 'Referido', 'Visita'];

function dueState(lead: Lead, today: string): 'late' | 'today' | null {
  if (!lead.nextAction || lead.stage === 'ganado' || lead.stage === 'perdido') return null;
  if (lead.nextAction.date < today) return 'late';
  if (lead.nextAction.date === today) return 'today';
  return null;
}

function DueTag({ lead, today }: { lead: Lead; today: string }) {
  const d = dueState(lead, today);
  if (!d) return null;
  return (
    <span className={`due ${d === 'late' ? 'due--late' : ''}`}>
      <CalendarClock size={12} aria-hidden="true" /> {d === 'late' ? 'Seguimiento vencido' : 'Seguimiento hoy'}
    </span>
  );
}

// ---------- Ficha del lead ----------

function LeadDrawer({ leadId, onClose }: { leadId: string | null; onClose: () => void }) {
  const s = useDemo();
  const toast = useToast();
  const lead = leadId ? s.leads.find((l) => l.id === leadId) : undefined;
  const [note, setNote] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextText, setNextText] = useState('');
  const [planId, setPlanId] = useState('');

  useEffect(() => {
    setNote('');
    setNextDate(lead?.nextAction?.date ?? '');
    setNextText(lead?.nextAction?.text ?? '');
    setPlanId('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  if (!lead) return <Drawer open={false} onClose={onClose} title="Lead">{null}</Drawer>;

  const saveNext = (e: FormEvent) => {
    e.preventDefault();
    if (!nextDate || !nextText.trim()) {
      updateLead(lead.id, { nextAction: null });
      toast('Seguimiento eliminado');
      return;
    }
    updateLead(lead.id, { nextAction: { date: nextDate, text: nextText.trim() } });
    toast('Seguimiento guardado');
  };

  const saveNote = (e: FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    addLeadNote(lead.id, note.trim());
    setNote('');
    toast('Nota guardada');
  };

  const closed = lead.stage === 'ganado' || lead.stage === 'perdido';

  return (
    <Drawer open onClose={onClose} title={lead.name}>
      <div className="stack stack--loose">
        <div className="cluster">
          <StageBadge stage={lead.stage} />
          <SedeTag sede={lead.sedeId} />
          <DueTag lead={lead} today={todayISO()} />
        </div>

        <dl className="detail">
          <dt>Empresa</dt>
          <dd>{lead.company || '—'}</dd>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${lead.email}`}>{lead.email}</a>
          </dd>
          <dt>Teléfono</dt>
          <dd>{lead.phone || '—'}</dd>
          <dt>Interés</dt>
          <dd>{lead.interest}</dd>
          <dt>Valor estimado</dt>
          <dd>{lead.value ? `${fmtMoney(lead.value)}/mes sin IVA` : 'Sin estimar'}</dd>
          <dt>Origen</dt>
          <dd>
            {lead.source} · {fmtStamp(lead.createdAt)}
          </dd>
        </dl>

        {lead.message && (
          <div>
            <h3 className="sub-title">Mensaje original</h3>
            <blockquote className="quote">{lead.message}</blockquote>
          </div>
        )}

        <div className="form-grid form-grid--2">
          <Field label="Etapa">
            {(id) => (
              <select id={id} className="select" value={lead.stage} onChange={(e) => moveLead(lead.id, e.target.value as LeadStage)}>
                {LEAD_STAGES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Responsable">
            {(id) => (
              <select id={id} className="select" value={lead.owner} onChange={(e) => updateLead(lead.id, { owner: e.target.value })}>
                {OWNERS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <form className="stack stack--tight" onSubmit={saveNext}>
          <h3 className="sub-title">Próximo seguimiento</h3>
          <div className="form-grid form-grid--follow">
            <Field label="Fecha">{(id) => <input id={id} type="date" className="input" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />}</Field>
            <Field label="Qué hay que hacer">{(id) => <input id={id} className="input" value={nextText} placeholder="Llamar, enviar propuesta…" onChange={(e) => setNextText(e.target.value)} />}</Field>
          </div>
          <div>
            <Button size="sm" type="submit">
              {nextDate && nextText.trim() ? 'Guardar seguimiento' : lead.nextAction ? 'Quitar seguimiento' : 'Guardar seguimiento'}
            </Button>
          </div>
        </form>

        <div className="stack stack--tight">
          <h3 className="sub-title">Notas</h3>
          {lead.notes.length === 0 ? (
            <p className="muted">Aún no hay notas. Apunta aquí cada contacto con el lead.</p>
          ) : (
            <ol className="timeline">
              {lead.notes.map((n, i) => (
                <li key={i}>
                  <p className="timeline__meta">
                    {n.author} · {fmtStamp(n.at)}
                  </p>
                  <p>{n.text}</p>
                </li>
              ))}
            </ol>
          )}
          <form className="stack stack--tight" onSubmit={saveNote}>
            <Field label="Nueva nota">{(id) => <textarea id={id} className="textarea textarea--sm" value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
            <div>
              <Button size="sm" type="submit" disabled={!note.trim()}>
                Guardar nota
              </Button>
            </div>
          </form>
        </div>

        {!closed && (
          <div className="convert">
            <h3 className="sub-title">Dar de alta como miembro</h3>
            <p className="muted">Crea la ficha en Clientes con estos datos y marca el lead como ganado.</p>
            <div className="form-grid form-grid--action">
              <Field label="Plan">
                {(id) => (
                  <select id={id} className="select" value={planId} onChange={(e) => setPlanId(e.target.value)}>
                    <option value="">Sin plan (cliente puntual)</option>
                    {s.plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {fmtMoney(p.price)}/mes
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Button
                variant="primary"
                onClick={() => {
                  convertLead(lead.id, planId || null);
                  toast(`${lead.name} ya es miembro de NODO ${SEDE_LABEL[lead.sedeId]}`);
                  onClose();
                }}
              >
                Dar de alta como miembro
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

// ---------- Alta de lead ----------

function NewLeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sede = useSede();
  const toast = useToast();
  const empty = { name: '', email: '', phone: '', company: '', sedeId: (sede === 'todas' ? 'coruna' : sede) as SedeId, interest: '', source: 'Web' as Lead['source'], value: '', message: '' };
  const [f, setF] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setF(empty);
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return setError('Escribe el nombre de la persona de contacto.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) && !f.phone.trim()) return setError('Añade un email válido o un teléfono para poder contactar.');
    if (!f.interest.trim()) return setError('Indica qué le interesa: un puesto, una sala, un evento…');
    createLead({
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      company: f.company.trim(),
      sedeId: f.sedeId,
      interest: f.interest.trim(),
      source: f.source,
      value: Number(f.value) || 0,
      message: f.message.trim() || undefined,
    });
    toast('Lead creado');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo lead"
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Descartar
          </Button>
          <Button variant="primary" type="submit" form="lead-form">
            Crear lead
          </Button>
        </>
      }
    >
      <form id="lead-form" className="stack" onSubmit={submit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-grid form-grid--2">
          <Field label="Nombre">{(id) => <input id={id} className="input" value={f.name} onChange={(e) => set('name', e.target.value)} />}</Field>
          <Field label="Empresa">{(id) => <input id={id} className="input" value={f.company} onChange={(e) => set('company', e.target.value)} />}</Field>
          <Field label="Email">{(id) => <input id={id} type="email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} />}</Field>
          <Field label="Teléfono">{(id) => <input id={id} type="tel" className="input" value={f.phone} onChange={(e) => set('phone', e.target.value)} />}</Field>
          <Field label="Sede">
            {(id) => (
              <select id={id} className="select" value={f.sedeId} onChange={(e) => set('sedeId', e.target.value as SedeId)}>
                {SEDE_ORDER.map((sd) => (
                  <option key={sd} value={sd}>
                    {SEDE_LABEL[sd]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Origen">
            {(id) => (
              <select id={id} className="select" value={f.source} onChange={(e) => set('source', e.target.value as Lead['source'])}>
                {SOURCES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <Field label="Interés">{(id) => <input id={id} className="input" value={f.interest} placeholder="Puesto The Hive Plus, sala por horas…" onChange={(e) => set('interest', e.target.value)} />}</Field>
        <Field label="Valor mensual estimado (€, sin IVA)">{(id) => <input id={id} type="number" min="0" className="input" value={f.value} onChange={(e) => set('value', e.target.value)} />}</Field>
        <Field label="Mensaje o contexto">{(id) => <textarea id={id} className="textarea" value={f.message} onChange={(e) => set('message', e.target.value)} />}</Field>
      </form>
    </Modal>
  );
}

// ---------- Vista ----------

export default function Leads() {
  const s = useDemo();
  const sede = useSede();
  const toast = useToast();
  const today = todayISO();
  const [mode, setMode] = useState<'tablero' | 'lista'>('tablero');
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStage | null>(null);

  const leads = inSede(s.leads, sede);
  const active = leads.filter((l) => l.stage !== 'ganado' && l.stage !== 'perdido');
  const pipeline = active.reduce((a, l) => a + l.value, 0);

  const onDrop = (e: DragEvent, stage: LeadStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragging;
    setOver(null);
    setDragging(null);
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    moveLead(lead.id, stage);
    toast(`${lead.name} pasa a «${LEAD_STAGES.find((x) => x.id === stage)!.label}»`);
  };

  return (
    <>
      <PageHead title="Leads" subtitle={`${active.length} oportunidades abiertas · ${fmtMoney(pipeline)}/mes en juego, sin IVA`}>
        <Segmented
          label="Vista"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'tablero', label: 'Tablero' },
            { value: 'lista', label: 'Lista' },
          ]}
        />
        <Button variant="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={() => setCreating(true)}>
          Nuevo lead
        </Button>
      </PageHead>

      {mode === 'tablero' ? (
        <>
          <p className="muted board-hint">Arrastra una tarjeta para cambiarla de etapa, o ábrela y cámbiala desde la ficha.</p>
          <div className="board">
            {LEAD_STAGES.map((st) => {
              const col = leads.filter((l) => l.stage === st.id);
              return (
                <section
                  key={st.id}
                  className={`board__col ${over === st.id ? 'is-over' : ''}`}
                  aria-label={st.label}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOver(st.id);
                  }}
                  onDragLeave={() => setOver((o) => (o === st.id ? null : o))}
                  onDrop={(e) => onDrop(e, st.id)}
                >
                  <header className="board__head">
                    <h2>
                      {st.label} <span className="board__count">{col.length}</span>
                    </h2>
                    <p>{fmtMoney(col.reduce((a, l) => a + l.value, 0))}/mes</p>
                  </header>
                  <ul className="board__list">
                    {col.map((l) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          className={`lead-card ${dragging === l.id ? 'is-dragging' : ''}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', l.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDragging(l.id);
                          }}
                          onDragEnd={() => {
                            setDragging(null);
                            setOver(null);
                          }}
                          onClick={() => setOpen(l.id)}
                        >
                          <span className="lead-card__name">{l.name}</span>
                          <span className="lead-card__company">{l.company}</span>
                          <span className="lead-card__interest">{l.interest}</span>
                          <span className="lead-card__foot">
                            <SedeTag sede={l.sedeId} />
                            <span className="lead-card__value">{l.value ? `${fmtMoney(l.value)}/mes` : 'Sin estimar'}</span>
                          </span>
                          <DueTag lead={l} today={today} />
                        </button>
                      </li>
                    ))}
                    {col.length === 0 && <li className="board__empty">Sin leads en esta etapa</li>}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      ) : (
        <Card flush>
          {leads.length === 0 ? (
            <EmptyState title="Todavía no hay leads" action={<Button variant="primary" onClick={() => setCreating(true)}>Nuevo lead</Button>}>
              Los contactos del formulario de la web aparecen aquí automáticamente.
            </EmptyState>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Interés</th>
                    <th>Sede</th>
                    <th>Etapa</th>
                    <th>Responsable</th>
                    <th>Seguimiento</th>
                    <th className="num">Valor/mes</th>
                    <th>Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="is-clickable" onClick={() => setOpen(l.id)}>
                      <td>
                        <button type="button" className="row-link cell-person__name" onClick={(e) => { e.stopPropagation(); setOpen(l.id); }}>
                          {l.name}
                        </button>
                        <p className="cell-person__sub">{l.company}</p>
                      </td>
                      <td>{l.interest}</td>
                      <td>
                        <SedeTag sede={l.sedeId} />
                      </td>
                      <td>
                        <StageBadge stage={l.stage} />
                      </td>
                      <td className={l.owner === 'Sin asignar' ? 'muted' : ''}>{l.owner}</td>
                      <td>
                        {l.nextAction ? (
                          <span className={dueState(l, today) === 'late' ? 'due due--late' : dueState(l, today) === 'today' ? 'due' : ''}>
                            {fmtRelativeDay(l.nextAction.date)} · {l.nextAction.text}
                          </span>
                        ) : (
                          <span className="muted">Sin programar</span>
                        )}
                      </td>
                      <td className="num">{l.value ? fmtMoney(l.value) : <span className="muted">—</span>}</td>
                      <td className="nowrap muted">{fmtDateNum(l.createdAt.slice(0, 10))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <LeadDrawer leadId={open} onClose={() => setOpen(null)} />
      <NewLeadModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
