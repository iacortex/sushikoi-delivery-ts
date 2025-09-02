import { useState } from 'react';
import { Address, Customer } from '@/types';
import { useGeocoding } from '@/hooks/useGeocoding';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';

export default function CustomerForm({ onSubmit }: { onSubmit: (c: Customer) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rawAddress, setRawAddress] = useState('');
  const [addr, setAddr] = useState<Address | null>(null);
  const { geocode, loading, error } = useGeocoding();

  const handleGeocode = async () => {
    const a = await geocode(rawAddress, 'Puerto Montt');
    setAddr(a);
  };

  const submit = () => {
    if (!addr) return;
    const customer: Customer = {
      id: crypto.randomUUID(),
      name,
      phone,
      address: addr
    };
    onSubmit(customer);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          className="input"
          placeholder="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Teléfono"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <div className="md:col-span-2 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Dirección exacta (ej: Playa Guabil 6191)"
            value={rawAddress}
            onChange={e => setRawAddress(e.target.value)}
          />
          <button onClick={handleGeocode} className="btn">
            Buscar
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner label="Buscando dirección exacta..." />}
      {error && <ErrorAlert message={error} />}

      {addr && (
        <div className="p-3 rounded-md border text-sm">
          <p className="font-medium">Dirección encontrada</p>
          <p className="text-gray-600">{addr.displayName}</p>
          <p className="text-gray-500">Confianza: {addr.confidence}</p>
          <button className="btn mt-2" onClick={submit}>
            Guardar Cliente
          </button>
        </div>
      )}
    </div>
  );
}
