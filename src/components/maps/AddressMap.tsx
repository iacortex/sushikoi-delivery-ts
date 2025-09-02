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

    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Leaflet load error'));
    document.head.appendChild(s);
  });
}

type Props = {
  /** Dirección inicial (opcional). Si viene con location, se centra ahí. */
  address?: Address | null;
  /** Callback cuando el usuario fija una ubicación (drag o click en el mapa). */
  onLocationSelect?: (addr: Address) => void;
  /** Alto del contenedor del mapa. */
  height?: number;
  /** Centro inicial si no hay address.location. */
  defaultCenter?: LatLng;
};

export default function AddressMap({
  address,
  onLocationSelect,
  height = 360,
  defaultCenter = { lat: -41.468, lng: -72.941 } // Puerto Montt aprox
}: Props) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const { reverse, loading, error } = useGeocoding();
  const [current, setCurrent] = useState<Address | null>(address ?? null);

  // Crea/actualiza mapa
  useEffect(() => {
    let mounted = true;

    (async () => {
      await loadLeaflet();
      if (!mapEl.current || !mounted) return;

      // Inicializa mapa
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      const start = address?.location ?? defaultCenter;
      const map = window.L.map(mapEl.current).setView([start.lat, start.lng], address?.location ? 16 : 14);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Crea marker (si hay coordenadas iniciales)
      const ensureMarker = (latlng: LatLng) => {
        if (!markerRef.current) {
          markerRef.current = window.L.marker([latlng.lat, latlng.lng], { draggable: true }).addTo(map);
          markerRef.current.on('dragend', async () => {
            const { lat, lng } = markerRef.current.getLatLng();
            await resolveAddress({ lat, lng });
          });
        } else {
          markerRef.current.setLatLng([latlng.lat, latlng.lng]);
        }
      };

      if (address?.location) ensureMarker(address.location);

      // Click en el mapa para reposicionar
      map.on('click', async (e: any) => {
        const latlng = { lat: e.latlng.lat, lng: e.latlng.lng };
        ensureMarker(latlng);
        await resolveAddress(latlng);
      });

      mapRef.current = map;
    })();

    return () => { mounted = false; if (mapRef.current) mapRef.current.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // crear una vez

  // Si cambió address desde fuera, centra y mueve marker
  useEffect(() => {
    if (!address?.location || !mapRef.current) return;
    const { lat, lng } = address.location;
    mapRef.current.setView([lat, lng], 16);
    if (!markerRef.current) {
      markerRef.current = window.L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on('dragend', async () => {
        const p = markerRef.current.getLatLng();
        await resolveAddress({ lat: p.lat, lng: p.lng });
      });
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    setCurrent(address);
  }, [address?.location?.lat, address?.location?.lng]); // solo reacciona a cambios reales

  // Reverse geocoding y propagación
  const resolveAddress = async (latlng: LatLng) => {
    const addr = await reverse(latlng);
    const next: Address = addr
      ? { ...addr, confidence: addr.confidence ?? 'approx', source: addr.source ?? 'nominatim' }
      : {
          raw: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`,
          displayName: undefined,
          location: latlng,
          confidence: 'manual',
          source: 'manual'
        };
    setCurrent(next);
    onLocationSelect?.(next);
  };

  return (
    <div className="space-y-2">
      <div ref={mapEl} className="w-full rounded-lg border" style={{ height }} />
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
