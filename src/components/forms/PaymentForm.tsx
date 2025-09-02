import { Payment, PaymentMethod, PaymentStatus } from '@/types';
import { useState } from 'react';

const METHODS: PaymentMethod[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'WEBPAY'];

export default function PaymentForm({
  amount,
  onChange
}: {
  amount: number;
  onChange: (p: Payment) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>('EFECTIVO');
  const [status, setStatus] = useState<PaymentStatus>('PENDIENTE');
  const [reference, setReference] = useState('');

  const emit = (m = method, s = status, r = reference) =>
    onChange({ method: m, status: s, amount, reference: r });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <select
        className="input"
        value={method}
        onChange={e => {
          const m = e.target.value as PaymentMethod;
          setMethod(m);
          emit(m);
        }}
      >
        {METHODS.map(m => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={status}
        onChange={e => {
          const s = e.target.value as PaymentStatus;
          setStatus(s);
          emit(undefined, s);
        }}
      >
        {['PENDIENTE', 'PAGADO', 'RECHAZADO', 'REEMBOLSADO'].map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <input
        className="input"
        placeholder="Referencia (opcional)"
        value={reference}
        onChange={e => {
          const v = e.target.value;
          setReference(v);
          emit(undefined, undefined, v);
        }}
      />
    </div>
  );
}
