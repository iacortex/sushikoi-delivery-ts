import { useEffect, useMemo, useState } from 'react';
import { formatCLP, pad } from '@/utils/formatting';
import DeliveryOrderCard from '@/components/orders/DeliveryOrderCard';
import { Order, Role } from '@/types';
import { fetchRoute } from '@/services/routing';

const ORIGIN = { lat: -41.46619826299714, lng: -72.99901571534275 };

const statusPillClass = {
  pending: 'bg-yellow-100 text-yellow-800',
  cooking: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-blue-100 text-blue-800',
} as const;

const orderStatuses = {
  pending: { label: 'Pendiente', icon: (props: any) => <span {...props}>⏳</span> },
  cooking: { label: 'En Cocina', icon: (props: any) => <span {...props}>🍳</span> },
  ready:   { label: 'Listo', icon: (props: any) => <span {...props}>📦</span> },
  delivered: { label: 'Entregado', icon: (props: any) => <span {...props}>✅</span> },
} as const;

export default function App() {
  const [role, setRole] = useState<Role>('cashier');
  const [orders, setOrders] = useState<Order[]>(() => {
    try { return JSON.parse(localStorage.getItem('sushi_orders_ts') || '[]'); } catch { return []; }
  });

  useEffect(() => localStorage.setItem('sushi_orders_ts', JSON.stringify(orders)), [orders]);

  // Auto marcar packed cuando termina 1:30 (si está en ready)
  useEffect(() => {
    const id = setInterval(() => {
      setOrders(prev => prev.map(o => {
        if (o.status === 'ready' && o.packUntil && !o.packed && Date.now() >= o.packUntil) {
          return { ...o, packed: true };
        }
        return o;
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const dashboard = useMemo(() => {
    const total = orders.reduce((s, o) => s + o.total, 0);
    const byStatus = orders.reduce((m: Record<string, number>, o) => {
      m[o.status] = (m[o.status] || 0) + 1; return m;
    }, {});
    const due = orders.filter(o => o.paymentStatus === 'due').length;
    return { total, byStatus, due };
  }, [orders]);

  const updateOrderStatus = (id: number, status: Order['status']) =>
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      if (status === 'ready' && !o.packUntil) return { ...o, status, packUntil: Date.now() + 90_000, packed: false };
      return { ...o, status };
    }));

  const confirmPayment = (id: number) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: 'paid' } : o));

  // Ejemplo: crear pedido dummy (puedes reemplazar por tu form)
  const crearPedidoDemo = async () => {
    const dest = { lat: -41.470479134794054, lng: -72.99901571534275 };
    const route = await fetchRoute(ORIGIN, dest);
    const nuevo: Order = {
      id: Date.now(),
      name: 'Cliente Demo',
      phone: '+56 9 1234 5678',
      address: 'Playa Guabil 6191',
      city: 'Puerto Montt',
      references: 'Casa esquina',
      cart: [{ id: 1, name: 'Promo Familiar', cookingTime: 25, originalPrice: 18900, discountPrice: 14900, quantity: 1 }],
      total: 14900,
      coordinates: dest,
      mapsUrl: `https://www.google.com/maps/dir/${ORIGIN.lat},${ORIGIN.lng}/${dest.lat},${dest.lng}`,
      wazeUrl: `https://waze.com/ul?ll=${dest.lat},${dest.lng}&navigate=yes`,
      status: 'pending',
      timestamp: new Date().toLocaleString('es-CL'),
      estimatedTime: 25,
      routeMeta: route ? { distance: route.distance, duration: route.duration } : null,
      createdBy: 'Cajero',
      geocodePrecision: 'exact',
      paymentMethod: 'debito',
      paymentStatus: 'paid',
      dueMethod: 'efectivo',
      packUntil: null,
      packed: false,
    };
    setOrders(prev => [...prev, nuevo]);
  };

  const filtered = role === 'cook'
    ? orders.filter(o => ['pending','cooking','ready'].includes(o.status))
    : role === 'delivery'
      ? orders.filter(o => ['ready','delivered'].includes(o.status))
      : orders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍣 Sushi Delivery Puerto Montt</h1>
          <p className="text-gray-600">Sistema con roles, geocodificación exacta y pagos</p>
        </header>

        <div className="mb-6 bg-white rounded-lg shadow p-4 flex flex-wrap items-center gap-2 justify-center">
          <button onClick={() => setRole('cashier')} className={`px-4 py-2 rounded-lg ${role==='cashier'?'bg-red-500 text-white':'bg-gray-100'}`}>🏪 Cajero</button>
          <button onClick={() => setRole('cook')}    className={`px-4 py-2 rounded-lg ${role==='cook'   ?'bg-orange-500 text-white':'bg-gray-100'}`}>👨‍🍳 Cocina</button>
          <button onClick={() => setRole('delivery')}className={`px-4 py-2 rounded-lg ${role==='delivery'?'bg-green-500 text-white':'bg-gray-100'}`}>🛵 Delivery</button>
          <span className="mx-2">|</span>
          <button onClick={crearPedidoDemo} className="px-4 py-2 rounded-lg bg-purple-600 text-white">➕ Pedido demo</button>
        </div>

        {/* dashboard mini */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow border">
            <p className="text-sm text-gray-500">Ventas totales</p>
            <p className="text-2xl font-bold text-emerald-600">${formatCLP(dashboard.total)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-gray-800">{dashboard.byStatus['pending'] || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border">
            <p className="text-sm text-gray-500">Por cobrar</p>
            <p className="text-2xl font-bold text-red-600">{dashboard.due}</p>
          </div>
        </div>

        {/* listas por rol */}
        {role === 'cook' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map(o => {
              let packingText: string | null = null;
              if (o.status === 'ready' && o.packUntil) {
                const secs = Math.max(0, Math.ceil((o.packUntil - Date.now())/1000));
                const mm = Math.floor(secs/60), ss = secs % 60;
                packingText = secs>0 ? `Empaque: ${pad(mm)}:${pad(ss)}` : 'Empaque finalizado';
              }
              return (
                <div key={o.id} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="font-bold">Pedido #{String(o.id).slice(-4)}</h3>
                      <p className="text-sm text-gray-600">{o.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusPillClass[o.status]}`}>{orderStatuses[o.status].label}</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 mb-2">
                    {o.cart.map((it, i) => <li key={i}>{it.quantity}x {it.name} — ⏱️ {it.cookingTime}min</li>)}
                  </ul>
                  {packingText && <p className={`text-sm font-semibold ${packingText.includes('finalizado')?'text-green-600':'text-amber-700'}`}>{packingText}</p>}
                  <div className="mt-3 flex gap-2">
                    {o.status==='pending'  && <button onClick={()=>updateOrderStatus(o.id,'cooking')} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded">Comenzar a cocinar</button>}
                    {o.status==='cooking'  && <button onClick={()=>updateOrderStatus(o.id,'ready')}   className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded">Marcar listo</button>}
                    {o.status==='ready'    && <button onClick={()=>updateOrderStatus(o.id,'delivered')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded" disabled={!o.packed}>Entregado</button>}
                  </div>
                </div>
              );
            })}
            {filtered.length===0 && <p className="text-gray-500">No hay pedidos en cocina.</p>}
          </div>
        )}

        {role === 'delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map(o => (
              <DeliveryOrderCard
                key={o.id}
                order={o}
                statusPillClass={statusPillClass}
                orderStatuses={orderStatuses as any}
                onConfirmPayment={()=>confirmPayment(o.id)}
                onDelivered={()=>updateOrderStatus(o.id,'delivered')}
              />
            ))}
            {filtered.length===0 && <p className="text-gray-500">Sin pedidos para repartir.</p>}
          </div>
        )}

        {role === 'cashier' && (
          <div className="bg-white rounded-lg p-4 shadow border">
            <p className="text-gray-500">Integraremos aquí: promociones, formulario cliente, mapa de selección y creación de pedido. (El botón “Pedido demo” arriba genera uno de prueba para el flujo completo).</p>
          </div>
        )}
      </div>
    </div>
  );
}
