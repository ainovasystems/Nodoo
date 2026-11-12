import '../app.css';
import './portal.css';
import { CalendarCheck, CalendarPlus, CreditCard, House, MessageSquare, type LucideIcon } from 'lucide-react';
import { useDemo, memberById } from '../store';
import { Avatar, DemoBar, EmptyState, ToastProvider, useHashRoute } from '../ui';
import { Inicio } from './views/Inicio';
import { Reservar } from './views/Reservar';
import { MisReservas } from './views/MisReservas';
import { Suscripcion } from './views/Suscripcion';
import { Consultas } from './views/Consultas';
import { Perfil } from './views/Perfil';
import type { ViewProps } from './helpers';

const NAV: { id: string; label: string; short: string; icon: LucideIcon }[] = [
  { id: 'inicio', label: 'Inicio', short: 'Inicio', icon: House },
  { id: 'reservar', label: 'Reservar', short: 'Reservar', icon: CalendarPlus },
  { id: 'reservas', label: 'Mis reservas', short: 'Reservas', icon: CalendarCheck },
  { id: 'suscripcion', label: 'Suscripción', short: 'Plan', icon: CreditCard },
  { id: 'consultas', label: 'Consultas', short: 'Consultas', icon: MessageSquare },
];

const VIEWS: Record<string, (props: ViewProps) => React.ReactNode> = {
  inicio: Inicio,
  reservar: Reservar,
  reservas: MisReservas,
  suscripcion: Suscripcion,
  consultas: Consultas,
  perfil: Perfil,
};

function Shell() {
  const state = useDemo();
  const [route, go] = useHashRoute('inicio');
  const [base, param] = route.split('/');
  const me = memberById(state, state.currentMemberId);
  const View = VIEWS[base];

  return (
    <div className="portal">
      <DemoBar current="portal" />
      <header className="portal-head">
        <div className="portal-head__inner">
          <a className="portal-head__logo" href="/">
            <img src="/img/logo.webp" width="520" height="200" alt="NODO Business Club" />
          </a>
          <nav className="portal-nav" aria-label="Secciones del portal">
            <ul>
              {NAV.map((item) => (
                <li key={item.id}>
                  <a href={`#/${item.id}`} aria-current={base === item.id ? 'page' : undefined}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#/perfil" aria-current={base === 'perfil' ? 'page' : undefined}>
                  Perfil
                </a>
              </li>
            </ul>
          </nav>
          {me && (
            <a className="portal-user" href="#/perfil" aria-label={`Perfil de ${me.name}`}>
              <Avatar name={me.name} />
              <span className="portal-user__name">{me.name}</span>
            </a>
          )}
        </div>
      </header>

      <main className="portal-main">
        {!me ? (
          <EmptyState title="No encontramos tu ficha de miembro">Restablece la demo desde la franja superior para volver a entrar.</EmptyState>
        ) : View ? (
          <View state={state} me={me} go={go} param={param} />
        ) : (
          <EmptyState title="Esta sección no existe" action={<a className="btn btn--primary" href="#/inicio">Ir al inicio</a>}>
            Puede que el enlace esté mal escrito.
          </EmptyState>
        )}
      </main>

      <nav className="portal-tabbar" aria-label="Secciones del portal">
        <ul>
          {NAV.map((item) => (
            <li key={item.id}>
              <a href={`#/${item.id}`} aria-current={base === item.id ? 'page' : undefined}>
                <item.icon size={20} aria-hidden="true" />
                <span>{item.short}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default function PortalApp() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
