import { LatLng } from '@/types';

export interface OsrmRoute {
  points: [number, number][]; // [lat,lng]
  distance: number;
  duration: number;
}

export async function fetchRoute(origin: LatLng, dest: LatLng): Promise<OsrmRoute | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&alternatives=false&steps=false&annotations=false&radiuses=100;100`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data?.routes?.[0]) return null;
  const r = data.routes[0];
  const points: [number, number][] = r.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
  return { points, distance: r.distance, duration: r.duration };
}
