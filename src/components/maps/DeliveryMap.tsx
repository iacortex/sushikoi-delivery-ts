import { useEffect, useRef } from 'react';
import { LatLng } from '@/types';
import { routeCar } from '@/services/routing';

declare global { interface Window { L: any } }

async function loadLeaflet() {
  if (window.L) return;
  await new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);

    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Leaflet load error'));
    document.head.appendChild(s);
  });
}

export default function DeliveryMap({
  origin,
  destination,
  height = 320,
  showMarkers = true
}: {
  origin: LatLng;
  destination: LatLng;
  height?: number;
  showMarkers?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadLeaflet();
      if (!mapRef.current || !mounted) return;

      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
      const map = window.L.map(mapRef.current).setView([destination.lat, destination.lng], 14);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      if (showMarkers) {
        window.L.marker([origin.lat, origin.lng]).addTo(map);
        window.L.marker([destination.lat, destination.lng]).addTo(map);
      }

      try {
        const route = await routeCar(origin, destination);
        if (route?.geometry) {
          // si quieres, puedes decodificar el polyline aquí
          const latlngs = [[origin.lat, origin.lng], [destination.lat, destination.lng]];
          window.L.polyline(latlngs as any, { color: 'blue', weight: 4, opacity: 0.85 }).addTo(map);
          map.fitBounds(latlngs as any, { padding: [40, 40] });
        } else {
          const latlngs = [[origin.lat, origin.lng], [destination.lat, destination.lng]];
          window.L.polyline(latlngs as any, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
          map.fitBounds(latlngs as any, { padding: [40, 40] });
        }
      } catch {
        const latlngs = [[origin.lat, origin.lng], [destination.lat, destination.lng]];
        window.L.polyline(latlngs as any, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
        map.fitBounds(latlngs as any, { padding: [40, 40] });
      }

      mapObj.current = map;
    })();
    return () => { mounted = false; if (mapObj.current) mapObj.current.remove(); };
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  return <div ref={mapRef} className="w-full rounded-lg border" style={{ height }} />;
}
