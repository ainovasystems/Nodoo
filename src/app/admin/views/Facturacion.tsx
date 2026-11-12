// Facturación: facturas emitidas, cobradas y pendientes.

import { useState } from 'react';
import { Button, Card, EmptyState, InvoiceBadge, PageHead, SedeTag, Segmented, Stat, useToast } from '../../ui';
import { inSede, memberById, setInvoiceStatus, useDemo } from '../../store';
import { fmtDateNum, fmtMoney, todayISO } from '../../dates';
import { useSede } from '../helpers';

type Filter = 'todas' | 'pendiente' | 'pagada';

export default function Facturacion() {
  const s = useDemo();
  const sede = useSede();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('todas');
  const month = todayISO().slice(0, 7);

  const all = inSede(s.invoices, sede);
  const thisMonth = all.filter((i) => i.date.startsWith(month));
  const pending = all.filter((i) => i.status === 'pendiente');
  const sum = (list: typeof all) => list.reduce((a, i) => a + i.amount, 0);

  const rows = all.filter((i) => filter === 'todas' || i.status === filter).sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number));

  return (
    <>
      <PageHead title="Facturación" subtitle="Cuotas mensuales de los planes. Importes sin IVA." />

      <div className="stat-grid">
        <Stat label="Facturado este mes" value={fmtMoney(sum(thisMonth))} hint={`${thisMonth.length} facturas emitidas`} />
        <Stat label="Pendiente de cobro" value={fmtMoney(sum(pending))} hint={pending.length ? `${pending.length} facturas sin cobrar` : 'Todo cobrado'} />
        <Stat label="Cobrado este mes" value={fmtMoney(sum(thisMonth.filter((i) => i.status === 'pagada')))} hint="Facturas del mes marcadas como pagadas" />
      </div>

      <div className="toolbar">
        <Segmented
          label="Estado de la factura"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'todas', label: 'Todas' },
            { value: 'pendiente', label: 'Pendientes' },
            { value: 'pagada', label: 'Pagadas' },
          ]}
        />
      </div>

      <Card flush>
        {rows.length === 0 ? (
          <EmptyState title={filter === 'pendiente' ? 'No hay facturas pendientes' : 'No hay facturas en esta vista'}>Cambia el filtro de estado o de sede para ver otras facturas.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Concepto</th>
                  <th className="num">Importe sin IVA</th>
                  <th>Estado</th>
                  <th>
                    <span className="visually-hidden">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => {
                  const m = memberById(s, i.memberId);
                  return (
                    <tr key={i.id}>
                      <td className="nowrap">{i.number}</td>
                      <td className="nowrap">{fmtDateNum(i.date)}</td>
                      <td>
                        <p className="cell-person__name">{m?.name}</p>
                        <p className="cell-person__sub">
                          {m?.company} · <SedeTag sede={i.sedeId} />
                        </p>
                      </td>
                      <td>{i.concept}</td>
                      <td className="num">{fmtMoney(i.amount)}</td>
                      <td>
                        <InvoiceBadge status={i.status} />
                      </td>
                      <td className="num">
                        {i.status === 'pendiente' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setInvoiceStatus(i.id, 'pagada');
                              toast(`Factura ${i.number} marcada como pagada`);
                            }}
                          >
                            Marcar como pagada
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
