// Panel interno de NODO (demo): gestión de reservas, leads, clientes,
// consultas, facturación y espacios de las dos sedes.

import '../app.css';
import './admin.css';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Receipt,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Avatar, DemoBar, Segmented, ToastProvider, useHashRoute } from '../ui';
import { inSede, useDemo } from '../store';
import { SedeContext, type SedeFilter } from './helpers';
import Resumen from './views/Resumen';
import Calendario from './views/Calendario';
import Reservas from './views/Reservas';
import Leads from './views/Leads';
import Clientes from './views/Clientes';
import Consultas from './views/Consultas';
import Facturacion from './views/Facturacion';
import Espacios from './views/Espacios';

const SEDE_KEY = 'nodo-demo-admin-sede';

const NAV: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'reservas', label: 'Reservas', icon: CalendarCheck },
  { id: 'leads', label: 'Leads', icon: UserPlus },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'consultas', label: 'Consultas', icon: MessageSquare },
  { id: 'facturacion', label: 'Facturación', icon: Receipt },
  { id: 'espacios', label: 'Espacios', icon: Building2 },
];

function readSede(): SedeFilter {
  try {
    const v = localStorage.getItem(SEDE_KEY);
    if (v === 'coruna' || v === 'lugo' || v === 'todas') return v;
  } catch {
    // sin almacenamiento: filtro por defecto
  }
  return 'todas';
}

function Shell() {
  const s = useDemo();
  const [route, go] = useHashRoute('resumen');
  const [sede, setSede] = useState<SedeFilter>(readSede);
  const [menuOpen, setMenuOpen] = useState(false);
  const view = NAV.some((n) => n.id === route) ? route : 'resumen';

  useEffect(() => {
    try {
      localStorage.setItem(SEDE_KEY, sede);
    } catch {
      // el filtro se mantiene en memoria
    }
  }, [sede]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [view]);

  const counts: Record<string, number> = {
    leads: inSede(s.leads, sede).filter((l) => l.stage === 'nuevo').length,
    consultas: inSede(s.tickets, sede).filter((t) => t.status === 'abierta').length,
  };

  return (
    <div className="shell">
      <aside className="shell__side">
        <div className="shell__brand">
          <a href="#/resumen" aria-label="Ir al resumen">
            <img src="/img/logo-light.webp" width="132" height="51" alt="NODO Business Club" />
          </a>
          <button
            type="button"
            className="shell__menu-btn"
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span className="visually-hidden">Menú</span>
          </button>
        </div>
        <nav id="admin-nav" className={`shell__nav ${menuOpen ? 'is-open' : ''}`} aria-label="Secciones del panel">
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#/${n.id}`} aria-current={view === n.id ? 'page' : undefined}>
                  <n.icon size={18} aria-hidden="true" />
                  <span>{n.label}</span>
                  {counts[n.id] ? (
                    <span className="shell__count">
                      {counts[n.id]}
                      <span className="visually-hidden"> {n.id === 'leads' ? 'nuevos' : 'abiertas'}</span>
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
          <a className="shell__back" href="/">
            <ArrowLeft size={16} aria-hidden="true" /> Volver a la web
          </a>
        </nav>
      </aside>

      <div className="shell__main">
        <header className="shell__top">
          <Segmented<SedeFilter>
            label="Sede"
            value={sede}
            onChange={setSede}
            options={[
              { value: 'todas', label: 'Todas' },
              { value: 'coruna', label: 'A Coruña' },
              { value: 'lugo', label: 'Lugo' },
            ]}
          />
          <div className="shell__user">
            <Avatar name="Equipo NODO" size="sm" />
            <span>Equipo NODO</span>
          </div>
        </header>
        <main className="shell__content">
          <SedeContext.Provider value={sede}>
            {view === 'resumen' && <Resumen go={go} />}
            {view === 'calendario' && <Calendario />}
            {view === 'reservas' && <Reservas />}
            {view === 'leads' && <Leads />}
            {view === 'clientes' && <Clientes />}
            {view === 'consultas' && <Consultas />}
            {view === 'facturacion' && <Facturacion />}
            {view === 'espacios' && <Espacios />}
          </SedeContext.Provider>
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <DemoBar current="panel" />
      <Shell />
    </ToastProvider>
  );
}
