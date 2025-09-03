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
      name,
      phone,
      address: addr,
      createdAt: new Date().toISOString(),
    };
    onSubmit(customer);
  };

  return (
    <div className="p-4 rounded-lg border bg-white space-y-3">
      <h2 className="font-bold">Datos del cliente</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="sm:col-span-2 flex gap-2">
          <input
            className="flex-1 border rounded-md px-3 py-2"
            placeholder="Dirección (ej: Playa Guabil 6191, Puerto Montt)"
            value={rawAddress}
            onChange={(e) => setRawAddress(e.target.value)}
          />
          <button className="px-3 py-2 rounded-md bg-sushi-600 text-white" onClick={handleGeocode}>
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
          <button className="px-3 py-2 rounded-md bg-black text-white mt-2" onClick={submit}>
            Guardar Cliente
          </button>
        </div>
      )}
    </div>
  );
}
