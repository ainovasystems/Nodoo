import { useEffect, useState, type FormEvent } from 'react';
import { ChevronRight, Plus, Send } from 'lucide-react';
import { fmtStamp } from '../../dates';
import { createTicket, replyTicket } from '../../store';
import { Button, Card, EmptyState, Drawer, Field, Modal, PageHead, TicketBadge, useToast } from '../../ui';
import type { Ticket } from '../../types';
import type { ViewProps } from '../helpers';

const CATEGORIES: Ticket['category'][] = ['Reservas', 'Facturación', 'Instalaciones', 'Suscripción', 'Otro'];

export function Consultas({ state, me, go, param }: ViewProps) {
  const toast = useToast();
  const [creating, setCreating] = useState(param === 'nueva');
  const [openId, setOpenId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<Ticket['category']>('Reservas');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<{ subject?: string; text?: string }>({});
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (param === 'nueva') setCreating(true);
  }, [param]);

  const tickets = state.tickets.filter((t) => t.memberId === me.id);
  const open = tickets.find((t) => t.id === openId) ?? null;

  const closeCreate = () => {
    setCreating(false);
    setErrors({});
    if (param === 'nueva') go('consultas');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!subject.trim()) next.subject = 'Escribe un asunto para la consulta.';
    if (!text.trim()) next.text = 'Cuéntanos qué necesitas.';
    setErrors(next);
    if (Object.keys(next).length) return;
    createTicket({ memberId: me.id, subject: subject.trim(), category, text: text.trim() });
    setSubject('');
    setText('');
    setCategory('Reservas');
    closeCreate();
    toast('Consulta enviada');
  };

  const sendReply = (e: FormEvent) => {
    e.preventDefault();
    if (!open || !reply.trim()) return;
    replyTicket(open.id, 'miembro', me.name, reply.trim());
    setReply('');
    toast('Respuesta enviada');
  };

  return (
    <>
      <PageHead title="Consultas" subtitle="Escribe al equipo de tu sede y sigue aquí la conversación.">
        <Button variant="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={() => setCreating(true)}>
          Abrir consulta
        </Button>
      </PageHead>

      <Card flush>
        {tickets.length === 0 ? (
          <EmptyState
            title="No has abierto ninguna consulta"
            action={
              <Button variant="primary" onClick={() => setCreating(true)}>
                Abrir consulta
              </Button>
            }
          >
            Dudas sobre reservas, facturas o las instalaciones: el equipo te responde aquí.
          </EmptyState>
        ) : (
          <ul className="ticket-list">
            {tickets.map((t) => (
              <li key={t.id}>
                <button type="button" className="ticket-row" onClick={() => setOpenId(t.id)}>
                  <span className="ticket-row__main">
                    <strong>{t.subject}</strong>
                    <span className="muted">
                      {t.category}, abierta el {fmtStamp(t.createdAt)}
                      {t.messages.length > 1 ? `, ${t.messages.length} mensajes` : ''}
                    </span>
                  </span>
                  <TicketBadge status={t.status} />
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={creating}
        onClose={closeCreate}
        title="Abrir consulta"
        footer={
          <>
            <Button onClick={closeCreate}>Descartar</Button>
            <Button variant="primary" type="submit" form="new-ticket">
              Enviar consulta
            </Button>
          </>
        }
      >
        <form id="new-ticket" className="form-grid" onSubmit={submit} noValidate>
          <Field label="Asunto" error={errors.subject}>
            {(id) => <input id={id} className="input" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />}
          </Field>
          <Field label="Categoría">
            {(id) => (
              <select id={id} className="select" value={category} onChange={(e) => setCategory(e.target.value as Ticket['category'])}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Mensaje" error={errors.text}>
            {(id) => <textarea id={id} className="textarea" value={text} onChange={(e) => setText(e.target.value)} rows={5} />}
          </Field>
        </form>
      </Modal>

      <Drawer
        open={open !== null}
        onClose={() => {
          setOpenId(null);
          setReply('');
        }}
        title={open?.subject ?? 'Consulta'}
      >
        {open && (
          <div className="thread">
            <div className="cluster">
              <TicketBadge status={open.status} />
              <span className="muted">{open.category}</span>
            </div>
            <ol className="thread__messages">
              {open.messages.map((m, i) => (
                <li key={i} className={`msg msg--${m.from}`}>
                  <p className="msg__meta">
                    <strong>{m.from === 'miembro' ? 'Tú' : m.author}</strong> <span>{fmtStamp(m.at)}</span>
                  </p>
                  <p className="msg__text">{m.text}</p>
                </li>
              ))}
            </ol>
            <form className="thread__reply" onSubmit={sendReply}>
              <Field label="Tu respuesta" hint={open.status === 'resuelta' ? 'Si respondes, la consulta se vuelve a abrir.' : undefined}>
                {(id) => <textarea id={id} className="textarea" value={reply} onChange={(e) => setReply(e.target.value)} rows={3} />}
              </Field>
              <Button variant="primary" type="submit" disabled={!reply.trim()} icon={<Send size={16} aria-hidden="true" />}>
                Enviar respuesta
              </Button>
            </form>
          </div>
        )}
      </Drawer>
    </>
  );
}
