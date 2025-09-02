import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import { Order } from '@/types';
import { formatCLP, formatDur, formatKm } from '@/utils';
import { routeCar } from '@/services/routing';

declare global { interface Window { L: any } }

// Punto de origen del local (ajústalo a tu dirección real)
const ORIGIN = {
  lat: -41.46619826299714,
  lng: -72.99901571534275,
  name: 'SushiKoi — Av. Capitán Ávalos 6130, Puerto Montt, Chile',
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

export default function DeliveryOrderCard({
  order,
  onConfirmPayment,
  onDelivered
}: {
  order: Order;
  onConfirmPayment?: (order: Order) => void;
  onDelivered?: (order: Order) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [distance, setDistance] = useState<number | null>(order.route?.distanceMeters ?? null);
  const [duration, setDuration] = useState<number | null>(order.route?.durationSeconds ?? null);

  const dest = order.customer.address.location ?? null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!dest) return;
      await loadLeaflet();

      // (1) Prepara mapa
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (!mapRef.current || !mounted) return;

      const map = window.L.map(mapRef.current).setView([dest.lat, dest.lng], 15);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      window.L.marker([ORIGIN.lat, ORIGIN.lng], { title: ORIGIN.name }).addTo(map);
      window.L.marker([dest.lat, dest.lng]).addTo(map);

      // (2) Dibuja ruta (usa la que venga en el pedido o consulta OSRM)
      try {
        if (order.route?.geometry) {
          // Si tu proyecto usa un decoder polyline, puedes decodificar aquí.
          // Fallback: unir puntos con línea recta.
          const latlngs = [[ORIGIN.lat, ORIGIN.lng], [dest.lat, dest.lng]];
          window.L.polyline(latlngs as any, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
          setDistance(order.route.distanceMeters);
          setDuration(order.route.durationSeconds);
          map.fitBounds(latlngs as any, { padding: [40, 40] });
        } else {
          const r = await routeCar({ lat: ORIGIN.lat, lng: ORIGIN.lng }, dest);
          if (r?.geometry) {
            // Si tienes L.PolylineUtil.decode disponible, úsalo. Fallback a línea recta:
            const latlngs = [[ORIGIN.lat, ORIGIN.lng], [dest.lat, dest.lng]];
            window.L.polyline(latlngs as any, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
            setDistance(r.distanceMeters);
            setDuration(r.durationSeconds);
            map.fitBounds(latlngs as any, { padding: [40, 40] });
          } else {
            const latlngs = [[ORIGIN.lat, ORIGIN.lng], [dest.lat, dest.lng]];
            window.L.polyline(latlngs as any, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
            map.fitBounds(latlngs as any, { padding: [40, 40] });
          }
        }
      } catch {
        const latlngs = [[ORIGIN.lat, ORIGIN.lng], [dest.lat, dest.lng]];
        window.L.polyline(latlngs as any, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
        map.fitBounds(latlngs as any, { padding: [40, 40] });
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
  }, [order.id, dest?.lat, dest?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  const unpaid = order.payment.status !== 'PAGADO';

  return (
    <div className="border-2 border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Pedido #{order.id.slice(0, 6)}</h3>
          <p className="text-gray-600 font-semibold">{order.customer.name}</p>
          {order.customer.phone && <p className="text-sm text-gray-500">{order.customer.phone}</p>}
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('es-CL')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-sm bg-gray-100">{order.status}</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Dirección:</h4>
          <p className="text-sm text-gray-600">
            {order.customer.address.displayName ?? order.customer.address.raw}
          </p>
          {order.customer.address.confidence !== 'exact' && (
            <p className="text-xs mt-2 px-2 py-1 rounded bg-amber-50 text-amber-800 inline-flex items-center gap-1">
              <AlertCircle size={12} /> Punto no exacto ({order.customer.address.confidence})
            </p>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Pago:</h4>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs ${
              unpaid ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {unpaid ? 'Por pagar' : 'Pagado'}
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 capitalize">
              {order.payment.method}
            </span>

            {unpaid && onConfirmPayment && (
              <button
                onClick={() => onConfirmPayment(order)}
                className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
              >
                <CheckCircle size={12} /> Confirmar pago
              </button>
            )}
          </div>

          <div className="mt-3 font-bold text-green-600 text-lg">
            Total: {formatCLP(order.total)}
          </div>

          {(distance != null && duration != null) && (
            <p className="mt-1 text-sm text-gray-600">
              🛣️ {formatKm(distance)} • ⏱️ {formatDur(duration)}
            </p>
          )}
        </div>
      </div>

      <div ref={mapRef} className="h-64 w-full rounded-lg border my-4" />

      {dest && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Inicio: <b>{ORIGIN.name}</b>
          </p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(order.navQrUrl ?? wazeUrl(dest.lat, dest.lng))}`}
            alt="QR Navegación"
            className="mx-auto mb-4 border rounded-lg shadow-sm"
          />
          <button
            onClick={() => window.open(gmapsDir(dest.lat, dest.lng), '_blank')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg mb-2 flex items-center justify-center gap-2"
          >
            <Navigation size={16} /> Abrir en Google Maps
          </button>
          <button
            onClick={() => window.open(wazeUrl(dest.lat, dest.lng), '_blank')}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Navigation size={16} /> Abrir en Waze
          </button>
        </div>
      )}

      {onDelivered && (
        <button
          onClick={() => onDelivered(order)}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} /> Marcar Entregado
        </button>
      )}
    </div>
  );
}
