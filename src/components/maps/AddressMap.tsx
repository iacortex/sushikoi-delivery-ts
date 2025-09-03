import { useEffect, useRef, useState } from 'react';
import { Address, LatLng } from '@/types';
import { useGeocoding } from '@/hooks/useGeocoding';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';

declare global { interface Window { L: any } }

async function loadLeaflet() {
  if (window.L) return;
  await new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Leaflet no pudo cargarse'));
    document.body.appendChild(script);
  });
}

export default function AddressMap({ address }: { address?: Address }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState<Address | null>(address ?? null);
  const { reverse, loading, error } = useGeocoding();

  useEffect(() => {
    (async () => {
      await loadLeaflet();
      if (!mapRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current).setView([-41.4699, -72.9994], 14); // Puerto Montt aprox
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      let marker: any = null;

      map.on('click', async (e: any) => {
        const latlng: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
        if (marker) marker.remove();
        marker = L.marker([latlng.lat, latlng.lng]).addTo(map);
        const addr = await reverse(latlng);
        setCurrent(addr);
      });
    })();
  }, []);

  return (
    <div className="p-4 rounded-lg border bg-white space-y-3">
      <h2 className="font-bold">Mapa</h2>
      <div ref={mapRef} className="h-80 rounded-md overflow-hidden" />
      {loading && <LoadingSpinner label="Obteniendo dirección..." />}
      {error && <ErrorAlert message={error} />}
      {current?.location && (
        <div className="text-xs text-gray-600">
          <p><b>Coords:</b> {current.location.lat.toFixed(6)}, {current.location.lng.toFixed(6)}</p>
          <p className="truncate"><b>Dirección:</b> {current.displayName ?? '—'}</p>
          <p><b>Confianza:</b> {current.confidence}</p>
        </div>
      )}
      {!current?.location && (
        <p className="text-xs text-gray-500">Haz click en el mapa para colocar el marcador y obtener la dirección.</p>
      )}
    </div>
  );
}
