// Consultas de los miembros: bandeja a la izquierda, hilo a la derecha.

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button, EmptyState, Field, PageHead, SedeTag, Segmented, TicketBadge, useToast } from '../../ui';
import { inSede, memberById, replyTicket, setTicketStatus, useDemo } from '../../store';
import { fmtStamp } from '../../dates';
import type { TicketStatus } from '../../types';
import { useSede } from '../helpers';

type Filter = 'abiertas' | 'resueltas' | 'todas';

export default function Consultas() {
  const s = useDemo();
  const sede = useSede();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('abiertas');
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const all = inSede(s.tickets, sede);
  const list = all
    .filter((t) => (filter === 'todas' ? true : filter === 'resueltas' ? t.status === 'resuelta' : t.status !== 'resuelta'))
    .sort((a, b) => b.messages[b.messages.length - 1].at.localeCompare(a.messages[a.messages.length - 1].at));
  const ticket = all.find((t) => t.id === selected);
  const member = ticket ? memberById(s, ticket.memberId) : undefined;

  useEffect(() => setReply(''), [selected]);

  // En pantallas anchas se abre la primera consulta para no dejar el hilo vacío.
  useEffect(() => {
    if (!selected && list.length > 0 && window.matchMedia('(min-width: 900px)').matches) setSelected(list[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sede]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!ticket || !reply.trim()) return;
    replyTicket(ticket.id, 'equipo', 'Equipo NODO', reply.trim());
    setReply('');
    toast('Respuesta enviada');
  };

  const mark = (status: TicketStatus, text: string) => {
    if (!ticket) return;
    setTicketStatus(ticket.id, status);
    toast(text);
  };

  const openCount = all.filter((t) => t.status !== 'resuelta').length;

  return (
    <>
      <PageHead title="Consultas" subtitle={openCount ? `${openCount} sin resolver` : 'Todas resueltas'}>
        <Segmented
          label="Filtrar consultas"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'abiertas', label: 'Sin resolver' },
            { value: 'resueltas', label: 'Resueltas' },
            { value: 'todas', label: 'Todas' },
          ]}
        />
      </PageHead>

      <div className={`inbox ${ticket ? 'has-selection' : ''}`}>
        <div className="inbox__list card card--flush">
          {list.length === 0 ? (
            <EmptyState title={filter === 'abiertas' ? 'No hay consultas sin resolver' : 'No hay consultas en esta vista'}>Las consultas que abran los miembros desde su portal aparecerán aquí.</EmptyState>
          ) : (
            <ul>
              {list.map((t) => (
                <li key={t.id}>
                  <button type="button" className="inbox__item" aria-current={t.id === selected ? 'true' : undefined} onClick={() => setSelected(t.id)}>
                    <span className="inbox__subject">{t.subject}</span>
                    <span className="inbox__meta">
                      {memberById(s, t.memberId)?.name} · {t.category}
                    </span>
                    <span className="inbox__foot">
                      <TicketBadge status={t.status} />
                      <span className="muted">{fmtStamp(t.messages[t.messages.length - 1].at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="inbox__thread card card--flush">
          {!ticket || !member ? (
            <EmptyState title="Elige una consulta">Selecciona una consulta de la lista para leer el hilo y responder.</EmptyState>
          ) : (
            <>
              <header className="thread__head">
                <button type="button" className="thread__back btn btn--quiet btn--sm" onClick={() => setSelected(null)}>
                  <ArrowLeft size={14} aria-hidden="true" /> Volver a la lista
                </button>
                <div className="thread__title">
                  <h2>{ticket.subject}</h2>
                  <p className="muted">
                    {member.name} · {member.company} · {ticket.category}
                  </p>
                </div>
                <div className="cluster">
                  <TicketBadge status={ticket.status} />
                  <SedeTag sede={ticket.sedeId} />
                </div>
              </header>

              <ol className="thread__messages">
                {ticket.messages.map((m, i) => (
                  <li key={i} className={`msg msg--${m.from}`}>
                    <p className="msg__meta">
                      {m.author} · {fmtStamp(m.at)}
                    </p>
                    <p className="msg__text">{m.text}</p>
                  </li>
                ))}
              </ol>

              <form className="thread__reply" onSubmit={send}>
                <Field label={`Responder a ${member.name.split(' ')[0]}`}>{(id) => <textarea id={id} className="textarea textarea--sm" value={reply} onChange={(e) => setReply(e.target.value)} />}</Field>
                <div className="thread__actions">
                  <div className="cluster">
                    {ticket.status === 'abierta' && (
                      <Button size="sm" onClick={() => mark('en curso', 'Consulta marcada como en curso')}>
                        Marcar en curso
                      </Button>
                    )}
                    {ticket.status !== 'resuelta' ? (
                      <Button size="sm" onClick={() => mark('resuelta', 'Consulta resuelta')}>
                        Marcar como resuelta
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => mark('abierta', 'Consulta reabierta')}>
                        Reabrir consulta
                      </Button>
                    )}
                  </div>
                  <Button variant="primary" type="submit" disabled={!reply.trim()}>
                    Enviar respuesta
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
