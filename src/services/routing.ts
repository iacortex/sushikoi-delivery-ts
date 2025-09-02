import { LatLng, RouteInfo } from '@/types';
import { OSRM_URL } from '@/utils';

/**
 * Obtiene ruta en auto con OSRM (servidor público).
 * Devuelve distancia, duración y polyline codificada (si está disponible).
 */
export async function routeCar(start: LatLng, end: LatLng): Promise<RouteInfo | null> {
  const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
  const url = `${OSRM_URL}/driving/${coords}?overview=full&geometries=polyline`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const route = json.routes?.[0];
  if (!route) return null;
  return {
    distanceMeters: Math.round(route.distance ?? 0),
    durationSeconds: Math.round(route.duration ?? 0),
    geometry: route.geometry // polyline
  };
}
