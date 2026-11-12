// Listado de reservas con filtros y exportación a CSV.

import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { BookingBadge, Button, Card, EmptyState, Field, PageHead, SEDE_LABEL, SedeTag, Segmented, useToast } from '../../ui';
import { bookingWho, inSede, spaceById, useDemo } from '../../store';
import { fmtDateNum, fmtMoney, fmtRange, fmtRelativeDay, todayISO } from '../../dates';
import type { BookingStatus } from '../../types';
import BookingModal from '../components/BookingModal';
import BookingDetail from '../components/BookingDetail';
import { byWhen, SOURCE_LABEL, useSede } from '../helpers';

type Range = 'proximas' | 'pasadas' | 'todas';

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export default function Reservas() {
  const s = useDemo();
  const sede = useSede();
  const toast = useToast();
  const today = todayISO();
  const [range, setRange] = useState<Range>('proximas');
  const [query, setQuery] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);

  const spaces = inSede(s.spaces, sede);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = inSede(s.bookings, sede).filter((b) => {
      if (range === 'proximas' && b.date < today) return false;
      if (range === 'pasadas' && b.date >= today) return false;
      if (spaceId && b.spaceId !== spaceId) return false;
      if (status && b.status !== status) return false;
      if (q && !bookingWho(s, b).toLowerCase().includes(q)) return false;
      return true;
    });
    list.sort(byWhen);
    if (range === 'pasadas') list.reverse();
    return list;
  }, [s, sede, range, query, spaceId, status, today]);

  const total = rows.filter((b) => b.status !== 'cancelada').reduce((sum, b) => sum + b.price, 0);

  const exportCsv = () => {
    const head = ['Fecha', 'Inicio', 'Fin', 'Espacio', 'Sede', 'Cliente', 'Estado', 'Importe sin IVA', 'Origen'];
    const lines = rows.map((b) => {
      const sp = spaceById(s, b.spaceId);
      return [fmtDateNum(b.date), fmtRange(b.start, b.end).split(' – ')[0], fmtRange(b.start, b.end).split(' – ')[1], sp.name, SEDE_LABEL[b.sedeId], bookingWho(s, b), b.status, String(b.price).replace('.', ','), SOURCE_LABEL[b.source]]
        .map(csvCell)
        .join(';');
    });
    const blob = new Blob(['﻿' + [head.map(csvCell).join(';'), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-nodo-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`CSV exportado con ${rows.length} reservas`);
  };

  return (
    <>
      <PageHead title="Reservas" subtitle={`${rows.length} reservas · ${fmtMoney(total)} sin IVA`}>
        <Button icon={<Download size={16} aria-hidden="true" />} onClick={exportCsv} disabled={rows.length === 0}>
          Exportar CSV
        </Button>
        <Button variant="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={() => setCreating(true)}>
          Nueva reserva
        </Button>
      </PageHead>

      <div className="toolbar">
        <Segmented
          label="Periodo"
          value={range}
          onChange={setRange}
          options={[
            { value: 'proximas', label: 'Próximas' },
            { value: 'pasadas', label: 'Pasadas' },
            { value: 'todas', label: 'Todas' },
          ]}
        />
        <div className="toolbar__field toolbar__field--grow">
          <Field label="Buscar por cliente">{(id) => <input id={id} type="search" className="input" value={query} placeholder="Nombre o empresa" onChange={(e) => setQuery(e.target.value)} />}</Field>
        </div>
        <div className="toolbar__field">
          <Field label="Espacio">
            {(id) => (
              <select id={id} className="select" value={spaceId} onChange={(e) => setSpaceId(e.target.value)}>
                <option value="">Todos</option>
                {spaces.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                    {sede === 'todas' ? ` · ${SEDE_LABEL[sp.sedeId]}` : ''}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <div className="toolbar__field">
          <Field label="Estado">
            {(id) => (
              <select id={id} className="select" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | '')}>
                <option value="">Todos</option>
                <option value="confirmada">Confirmada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            )}
          </Field>
        </div>
      </div>

      <Card flush>
        {rows.length === 0 ? (
          <EmptyState title="Ninguna reserva coincide con los filtros">Cambia el periodo o limpia la búsqueda para ver más reservas.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Espacio</th>
                  <th>Sede</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th className="num">Importe sin IVA</th>
                  <th>Origen</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 200).map((b) => {
                  const sp = spaceById(s, b.spaceId);
                  return (
                    <tr key={b.id} className="is-clickable" onClick={() => setDetail(b.id)}>
                      <td className="nowrap">
                        <button type="button" className="row-link" onClick={(e) => { e.stopPropagation(); setDetail(b.id); }}>
                          {fmtRelativeDay(b.date)}
                        </button>
                      </td>
                      <td className="nowrap">{sp.mode === 'jornada' ? 'Jornada completa' : fmtRange(b.start, b.end)}</td>
                      <td>{sp.name}</td>
                      <td>
                        <SedeTag sede={b.sedeId} />
                      </td>
                      <td>
                        {bookingWho(s, b)}
                        {!b.memberId && <span className="muted"> · externo</span>}
                      </td>
                      <td>
                        <BookingBadge status={b.status} />
                      </td>
                      <td className="num">{b.price > 0 ? fmtMoney(b.price) : <span className="muted">Incluido en el plan</span>}</td>
                      <td className="muted">{SOURCE_LABEL[b.source]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {rows.length > 200 && <p className="muted table-foot">Se muestran las primeras 200. El CSV incluye las {rows.length}.</p>}

      <BookingModal open={creating} onClose={() => setCreating(false)} />
      <BookingDetail bookingId={detail} onClose={() => setDetail(null)} />
    </>
  );
}
