import { useEffect, useState, type FormEvent } from 'react';
import { fmtDateNum } from '../../dates';
import { planById, updateMember } from '../../store';
import { Avatar, Button, Card, Field, MemberBadge, PageHead, SedeTag, useToast } from '../../ui';
import type { ViewProps } from '../helpers';

export function Perfil({ state, me }: ViewProps) {
  const toast = useToast();
  const [form, setForm] = useState({ name: me.name, email: me.email, phone: me.phone, company: me.company });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const plan = planById(state, me.planId);

  // Si la ficha cambia desde fuera (panel interno o restablecer demo), el formulario la sigue.
  useEffect(() => {
    setForm({ name: me.name, email: me.email, phone: me.phone, company: me.company });
    setErrors({});
  }, [me.name, me.email, me.phone, me.company]);

  const dirty = form.name !== me.name || form.email !== me.email || form.phone !== me.phone || form.company !== me.company;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Escribe tu nombre.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Escribe un email válido, como nombre@empresa.com.';
    setErrors(next);
    if (Object.keys(next).length) return;
    updateMember(me.id, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), company: form.company.trim() });
    toast('Perfil guardado');
  };

  return (
    <>
      <PageHead title="Perfil" subtitle="Tus datos de contacto y de miembro." />

      <div className="profile-grid">
        <Card title="Datos de contacto">
          <form className="form-grid" onSubmit={save} noValidate>
            <div className="form-grid form-grid--2">
              <Field label="Nombre y apellidos" error={errors.name}>
                {(id) => <input id={id} className="input" value={form.name} onChange={set('name')} autoComplete="name" />}
              </Field>
              <Field label="Empresa">{(id) => <input id={id} className="input" value={form.company} onChange={set('company')} autoComplete="organization" />}</Field>
              <Field label="Email" error={errors.email}>
                {(id) => <input id={id} className="input" type="email" value={form.email} onChange={set('email')} autoComplete="email" />}
              </Field>
              <Field label="Teléfono">{(id) => <input id={id} className="input" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />}</Field>
            </div>
            <div>
              <Button variant="primary" type="submit" disabled={!dirty}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Tu ficha de miembro">
          <div className="stack">
            <div className="cell-person">
              <Avatar name={me.name} size="lg" />
              <div>
                <p className="cell-person__name">{me.name}</p>
                <p className="cell-person__sub">{me.company}</p>
              </div>
            </div>
            <dl className="detail">
              <dt>Sede de referencia</dt>
              <dd>
                <SedeTag sede={me.sedeId} />
              </dd>
              <dt>Miembro desde</dt>
              <dd>{fmtDateNum(me.since)}</dd>
              <dt>Plan</dt>
              <dd>{plan ? plan.name : 'Sin plan mensual'}</dd>
              <dt>Estado</dt>
              <dd>
                <MemberBadge status={me.status} />
              </dd>
            </dl>
            <p className="muted">
              Para cambiar de sede de referencia, <a href="#/consultas/nueva">abre una consulta</a>.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
