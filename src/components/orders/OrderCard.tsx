import { Order } from '@/types';
import { formatCLP } from '@/utils';

export default function OrderCard({ order }: { order: Order }) {
  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Pedido #{order.id.slice(0, 6)}</p>
        <span className="text-xs px-2 py-1 rounded bg-gray-100">{order.status}</span>
      </div>

      <p className="text-sm text-gray-600">
        {order.customer.name} — {order.customer.address.displayName ?? order.customer.address.raw}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <p className="font-bold">{formatCLP(order.total)}</p>
        <span className={`text-xs px-2 py-1 rounded ${
          order.payment.status === 'PAGADO'
            ? 'bg-green-100 text-green-700'
            : order.payment.status === 'PENDIENTE'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-red-100 text-red-700'
        }`}>
          {order.payment.status}
        </span>
      </div>
    </div>
  );
}
