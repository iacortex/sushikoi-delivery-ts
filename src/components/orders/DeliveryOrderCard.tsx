import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import { formatCLP, formatDur, formatKm } from '@/utils/formatting';
import { fetchRoute } from '@/services/routing';
import { Order } from '@/types';

declare global { interface Window { L: any; } }

const ORIGIN = {
  lat: -41.46619826299714,
  lng: -72.99901571534275,
  name: 'Sushikoi — Av. Capitán Ávalos 6130, Puerto Montt, Chile',
};

const gmapsDir = (dLat: number, dLng: number) =>
  `https://www.google.com/maps/dir/${ORIGIN.lat},${ORIGIN.lng}/${dLat},${dLng}`;
const wazeUrl = (dLat: number, dLng: number) =>
  `https://waze.com/ul?ll=${dLat},${dLng}&navigate=yes`;

async function loadLeaflet(): Promise<void> {
  if (window.L) return;
  await new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Leaflet load error'));
    document.head.appendChild(script);
  });
}

export interface DeliveryOrderCardProps {
  order: Order;
  statusPillClass: Record<Order['status'], string>;
  orderStatuses: Record<Order['status'], { label: string; icon: any }>;
  onDelivered: () => void;
  onConfirmPayment: () => void;
}

export default function DeliveryOrderCard({
  order, statusPillClass, orderStatuses, onDelivered, onConfirmPayment,
}: DeliveryOrderCardProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!order.coordinates) return;
      await loadLeaflet();

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (!mapRef.current || !mounted) return;

      const { lat, lng } = order.coordinates;
      const map = window.L.map(mapRef.current).setView([lat, lng], 15);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      window.L.marker([ORIGIN.lat, ORIGIN.lng], { title: ORIGIN.name }).addTo(map);
      window.L.marker([lat, lng]).addTo(map);

      try {
        const route = await fetchRoute({ lat: ORIGIN.lat, lng: ORIGIN.lng }, { lat, lng });
        if (route?.points?.length) {
          window.L.polyline(route.points, { color: 'blue', weight: 4, opacity: 0.85 }).addTo(map);
          const bounds = window.L.latLngBounds(route.points);
          bounds.extend([ORIGIN.lat, ORIGIN.lng]);
          bounds.extend([lat, lng]);
          map.fitBounds(bounds, { padding: [40, 40] });
        } else {
          const latlngs = [[ORIGIN.lat, ORIGIN.lng], [lat, lng]];
          window.L.polyline(latlngs, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
          map.fitBounds(latlngs, { padding: [40, 40] });
        }
      } catch {
        const latlngs = [[ORIGIN.lat, ORIGIN.lng], [lat, lng]];
        window.L.polyline(latlngs, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
        map.fitBounds(latlngs, { padding: [40, 40] });
      }

      mapInstanceRef.current = map;
    })();
    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order.coordinates, order.id]);

  const StatusIcon = orderStatuses[order.status].icon;
  const unpaid = order.paymentStatus === 'due';

  return (
    <div className="border-2 border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Pedido #{String(order.id).slice(-4)}</h3>
          <p className="text-gray-600 font-semibold">{order.name}</p>
          <p className="text-sm text-gray-500">{order.phone}</p>
          <p className="text-sm text-gray-500">{order.timestamp}</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusPillClass[order.status]}`}>
          <StatusIcon size={14} /> {orderStatuses[order.status].label}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Dirección:</h4>
          <p className="text-sm text-gray-600">{order.address}</p>
          <p className="text-sm text-gray-600">{order.city}</p>
          {order.references && (
            <p className="text-sm text-blue-600 mt-1"><strong>Ref:</strong> {order.references}</p>
          )}
          {order.geocodePrecision && order.geocodePrecision !== 'exact' && (
            <p className="text-xs mt-2 px-2 py-1 rounded bg-amber-50 text-amber-800 inline-flex items-center gap-1">
              <AlertCircle size={12} /> Punto aproximado ({order.geocodePrecision})
            </p>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Pedido:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {order.cart.map((it, i) => (
              <li key={i}>{it.quantity}x {it.name}</li>
            ))}
          </ul>

          <div className="mt-3 text-sm">
            <p className="font-semibold text-gray-700 mb-1">Pago</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs ${unpaid ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {unpaid ? 'Por pagar' : 'Pagado'}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 capitalize">
                {unpaid ? `Pagará: ${order.dueMethod}` : `Método: ${order.paymentMethod}`}
              </span>
              {unpaid && (
                <button onClick={onConfirmPayment}
                  className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1">
                  <CheckCircle size={12} /> Confirmar pago
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {order.routeMeta && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-green-600 text-lg">Total: ${formatCLP(order.total)}</span>
          <span className="text-sm text-gray-600">🛣️ {formatKm(order.routeMeta.distance)} • ⏱️ {formatDur(order.routeMeta.duration)}</span>
        </div>
      )}

      <div ref={mapRef} className="h-64 w-full rounded-lg border my-4" />

      {order.coordinates && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">Inicio: <b>{ORIGIN.name}</b></p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(order.wazeUrl || wazeUrl(order.coordinates.lat, order.coordinates.lng))}`}
            alt="QR Waze"
            className="mx-auto mb-4 border rounded-lg shadow-sm"
          />
          <button onClick={() => window.open(gmapsDir(order.coordinates.lat, order.coordinates.lng), '_blank')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg mb-2 flex items-center justify-center gap-2">
            <Navigation size={16} /> Abrir en Google Maps
          </button>
          <button onClick={() => window.open(wazeUrl(order.coordinates.lat, order.coordinates.lng), '_blank')}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2">
            <Navigation size={16} /> Abrir en Waze
          </button>
        </div>
      )}

      {order.status === 'ready' && (
        <button onClick={onDelivered}
                disabled={order.paymentStatus === 'due'}
                className={`mt-4 w-full ${order.paymentStatus === 'due' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2`}>
          <CheckCircle size={16} /> Marcar Entregado
        </button>
      )}
    </div>
  );
}
