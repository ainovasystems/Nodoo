// Gráficos del panel. HTML propio, sin librerías: una lista de medidores
// (una ratio por fila) y un gráfico de columnas de una sola serie.

import type { ReactNode } from 'react';

export interface MeterRow {
  id: string;
  name: ReactNode;
  /** De 0 a 1. */
  ratio: number;
  figure: string;
  /** Detalle que aparece al pasar el cursor o enfocar la fila. */
  detail: string;
}

/** Varias ratios, una por fila, cada una contra su propio total. */
export function MeterList({ rows }: { rows: MeterRow[] }) {
  return (
    <ul className="meters">
      {rows.map((r) => (
        <li key={r.id} className="meter" tabIndex={0}>
          <span className="meter__name">{r.name}</span>
          <span className="meter__track" aria-hidden="true">
            <span className="meter__fill" style={{ width: `${Math.min(100, Math.max(r.ratio > 0 ? 2 : 0, r.ratio * 100))}%` }} />
          </span>
          <span className="meter__figure">{r.figure}</span>
          <span className="chart-tip" role="tooltip">
            {r.detail}
          </span>
        </li>
      ))}
    </ul>
  );
}

export interface ColumnDatum {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  detail: string;
  current?: boolean;
}

/** Columnas de una sola serie sobre una línea base común. */
export function ColumnChart({ data, unit }: { data: ColumnDatum[]; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ol className="columns" aria-label={`Gráfico de columnas: ${unit}`}>
      {data.map((d) => (
        <li key={d.id} className="column" tabIndex={0} aria-label={d.detail}>
          <span className="column__plot" aria-hidden="true">
            <span className="column__value">{d.value}</span>
            <span className="column__bar" style={{ ['--v' as string]: d.value / max }} />
          </span>
          <span className={`column__label ${d.current ? 'is-current' : ''}`} aria-hidden="true">
            {d.label}
            {d.sublabel && <span className="column__sub">{d.sublabel}</span>}
          </span>
          <span className="chart-tip" role="tooltip">
            {d.detail}
          </span>
        </li>
      ))}
    </ol>
  );
}
