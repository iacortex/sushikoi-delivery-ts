import { Order } from '@/types';
import { formatCLP } from '@/utils';

export default function OrderHistory({ orders }: { orders: Order[] }) {
  if (!orders.length) return <p className="text-gray-500">Sin pedidos aún.</p>;

  return (
    <div className="space-y-3">
      {orders.map(o => (
        <div key={o.id} className="p-3 rounded-lg border bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                #{o.id.slice(0, 6)} — {o.customer.name}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(o.createdAt).toLocaleString('es-CL')}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-gray-100">{o.status}</span>
          </div>

          <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-3">
            {o.items.map((it, i) => (
              <span key={i}>{it.qty}x {it.name}</span>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="font-bold">{formatCLP(o.total)}</p>
            <span className="text-xs text-gray-500">
              Última act.: {new Date(o.updatedAt).toLocaleTimeString('es-CL')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
