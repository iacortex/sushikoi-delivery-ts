export interface ClientAgg {
  name: string;
  phone?: string;
  total: number;
  count: number;
}

export default function TopClients({ data }: { data: ClientAgg[] }) {
  if (!data.length) return <p className="text-gray-500">Sin datos aún</p>;
  return (
    <div className="bg-white rounded-lg p-4 shadow border">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Top clientes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">Cliente</th>
              <th className="py-2">Teléfono</th>
              <th className="py-2">Pedidos</th>
              <th className="py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={i} className="border-t">
                <td className="py-2">{c.name}</td>
                <td className="py-2">{c.phone ?? '—'}</td>
                <td className="py-2">{c.count}</td>
                <td className="py-2 font-semibold">
                  ${new Intl.NumberFormat('es-CL').format(c.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
