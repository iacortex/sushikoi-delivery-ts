import { Address, LatLng } from '@/types';
import { NOMINATIM_URL, REVERSE_URL } from '@/utils';

// Respetar la policy de Nominatim (identifícate con un User-Agent descriptivo)
const headers = {
  Accept: 'application/json',
  'User-Agent': 'SushiKoi-Delivery/1.0 (iacortex)'
};

/**
 * Geocodifica una dirección libre y prioriza resultados con número de casa
 * si el usuario lo incluyó. Usa país CL y limita a 5 resultados.
 */
export async function geocodeExact(query: string, cityHint?: string): Promise<Address | null> {
  const q = cityHint ? `${query}, ${cityHint}` : query;
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '5');
  url.searchParams.set('countrycodes', 'cl');

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) return null;
  const list = (await res.json()) as any[];
  if (!list.length) return null;

  // Preferir resultados con house_number si el input tenía numeración
  const wroteNumber = /\d/.test(query);
  const withNumber = wroteNumber ? list.find(r => r.address?.house_number) : list[0];
  const best = withNumber ?? list[0];

  const addr = fromNominatim(best);
  addr.confidence = wroteNumber && addr.houseNumber ? 'exact' : 'approx';
  addr.source = 'nominatim';
  return addr;
}

/** Reverse geocoding: coord -> dirección humana */
export async function reverseGeocode({ lat, lng }: LatLng): Promise<Address | null> {
  const url = new URL(REVERSE_URL);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) return null;
  const r = await res.json();
  const addr = fromNominatim(r);
  addr.confidence = 'approx';
  addr.source = 'reverse';
  return addr;
}

function fromNominatim(r: any): Address {
  const a = r.address ?? {};
  return {
    raw: r.display_name ?? '',
    displayName: r.display_name,
    houseNumber: a.house_number,
    street: a.road || a.pedestrian || a.footway || a.path || a.neighbourhood,
    city: a.city || a.town || a.village || a.hamlet,
    region: a.state,
    postcode: a.postcode,
    country: a.country,
    location: r.lat && r.lon ? { lat: parseFloat(r.lat), lng: parseFloat(r.lon) } : undefined,
    confidence: 'approx',
    source: 'nominatim',
  };
}
