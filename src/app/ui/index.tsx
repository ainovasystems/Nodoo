// Kit de interfaz compartido por el portal de miembros y el panel interno.
// Cualquier pieza que se repita en las dos aplicaciones vive aquí.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { RotateCcw, X } from 'lucide-react';
import { resetDemo } from '../store';
import type { BookingStatus, LeadStage, MemberStatus, SedeId, TicketStatus } from '../types';
import { LEAD_STAGES } from '../types';

// ---------- Botones ----------

type ButtonVariant = 'primary' | 'dark' | 'ghost' | 'danger' | 'quiet';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: ReactNode;
}

export function Button({ variant = 'ghost', size = 'md', icon, children, className = '', type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={`btn btn--${variant} ${size === 'sm' ? 'btn--sm' : ''} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}

/** Botón solo con icono. `label` es obligatorio: es su nombre accesible. */
export function IconButton({ label, children, className = '', ...rest }: { label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`icon-btn ${className}`} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}

// ---------- Etiquetas de estado ----------

type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral' | 'accent';

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

const BOOKING_TONE: Record<BookingStatus, Tone> = { confirmada: 'ok', pendiente: 'warn', cancelada: 'neutral' };
const BOOKING_LABEL: Record<BookingStatus, string> = { confirmada: 'Confirmada', pendiente: 'Pendiente', cancelada: 'Cancelada' };
export const BookingBadge = ({ status }: { status: BookingStatus }) => <Badge tone={BOOKING_TONE[status]}>{BOOKING_LABEL[status]}</Badge>;

const TICKET_TONE: Record<TicketStatus, Tone> = { abierta: 'warn', 'en curso': 'info', resuelta: 'ok' };
const TICKET_LABEL: Record<TicketStatus, string> = { abierta: 'Abierta', 'en curso': 'En curso', resuelta: 'Resuelta' };
export const TicketBadge = ({ status }: { status: TicketStatus }) => <Badge tone={TICKET_TONE[status]}>{TICKET_LABEL[status]}</Badge>;

const MEMBER_TONE: Record<MemberStatus, Tone> = { activo: 'ok', pausado: 'warn', baja: 'neutral' };
const MEMBER_LABEL: Record<MemberStatus, string> = { activo: 'Activo', pausado: 'En pausa', baja: 'Baja' };
export const MemberBadge = ({ status }: { status: MemberStatus }) => <Badge tone={MEMBER_TONE[status]}>{MEMBER_LABEL[status]}</Badge>;

const STAGE_TONE: Record<LeadStage, Tone> = { nuevo: 'accent', contactado: 'info', visita: 'info', propuesta: 'warn', ganado: 'ok', perdido: 'neutral' };
export const StageBadge = ({ stage }: { stage: LeadStage }) => (
  <Badge tone={STAGE_TONE[stage]}>{LEAD_STAGES.find((s) => s.id === stage)!.label}</Badge>
);

export const InvoiceBadge = ({ status }: { status: 'pagada' | 'pendiente' }) => (
  <Badge tone={status === 'pagada' ? 'ok' : 'warn'}>{status === 'pagada' ? 'Pagada' : 'Pendiente'}</Badge>
);

export const SEDE_LABEL: Record<SedeId, string> = { coruna: 'A Coruña', lugo: 'Lugo' };
export const SedeTag = ({ sede }: { sede: SedeId }) => <span className={`sede-tag sede-tag--${sede}`}>{SEDE_LABEL[sede]}</span>;

// ---------- Contenedores ----------

export function Card({ title, action, children, className = '', flush = false }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={`card ${flush ? 'card--flush' : ''} ${className}`}>
      {(title || action) && (
        <header className="card__head">
          {title && <h2 className="card__title">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHead({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <h1 className="page-head__title">{title}</h1>
        {subtitle && <p className="page-head__sub">{subtitle}</p>}
      </div>
      {children && <div className="page-head__actions">{children}</div>}
    </header>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'accent' }) {
  return (
    <div className={`stat ${tone ? `stat--${tone}` : ''}`}>
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {hint && <p className="stat__hint">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {children && <p className="empty__text">{children}</p>}
      {action}
    </div>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join('')
    .toUpperCase();
  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {initials}
    </span>
  );
}

// ---------- Formularios ----------

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children(id)}
      {error ? <p className="field__error">{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className="segmented__item" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Diálogos ----------

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  const onClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };
  return { ref, onClick, onCancel: (e: React.SyntheticEvent) => { e.preventDefault(); onClose(); } };
}

/** Ventana centrada para crear o confirmar algo. */
export function Modal({ open, onClose, title, children, footer }: DialogProps) {
  const d = useDialog(open, onClose);
  return (
    <dialog ref={d.ref} className="dialog dialog--modal" onClick={d.onClick} onCancel={d.onCancel} aria-label={title}>
      {open && (
        <div className="dialog__panel">
          <header className="dialog__head">
            <h2 className="dialog__title">{title}</h2>
            <IconButton label="Cerrar" onClick={onClose}>
              <X size={18} />
            </IconButton>
          </header>
          <div className="dialog__body">{children}</div>
          {footer && <footer className="dialog__foot">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

/** Panel lateral para ver y editar la ficha de un registro. */
export function Drawer({ open, onClose, title, children, footer }: DialogProps) {
  const d = useDialog(open, onClose);
  return (
    <dialog ref={d.ref} className="dialog dialog--drawer" onClick={d.onClick} onCancel={d.onCancel} aria-label={title}>
      {open && (
        <div className="dialog__panel">
          <header className="dialog__head">
            <h2 className="dialog__title">{title}</h2>
            <IconButton label="Cerrar" onClick={onClose}>
              <X size={18} />
            </IconButton>
          </header>
          <div className="dialog__body">{children}</div>
          {footer && <footer className="dialog__foot">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

// ---------- Avisos ----------

interface Toast {
  id: number;
  text: string;
  tone: 'ok' | 'danger';
}

const ToastContext = createContext<(text: string, tone?: Toast['tone']) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---------- Navegación ----------

/** Ruta interna guardada en el hash (#/reservas): sobrevive a recargar. */
export function useHashRoute(fallback: string): [string, (route: string) => void] {
  const parse = () => window.location.hash.replace(/^#\/?/, '') || fallback;
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const go = useCallback((r: string) => {
    window.location.hash = `/${r}`;
  }, []);
  return [route, go];
}

/** Franja superior que recuerda que es una demo y permite reiniciarla. */
export function DemoBar({ current }: { current: 'portal' | 'panel' }) {
  const toast = useToast();
  return (
    <div className="demo-bar">
      <p>
        <strong>Demo.</strong> Datos ficticios guardados solo en este navegador.
      </p>
      <div className="demo-bar__actions">
        <a href={current === 'portal' ? '/app/admin/' : '/app/portal/'}>
          {current === 'portal' ? 'Ver el panel interno' : 'Ver el portal de miembros'}
        </a>
        <button
          type="button"
          onClick={() => {
            resetDemo();
            toast('Demo restablecida a los datos iniciales');
          }}
        >
          <RotateCcw size={14} aria-hidden="true" /> Restablecer demo
        </button>
      </div>
    </div>
  );
}
