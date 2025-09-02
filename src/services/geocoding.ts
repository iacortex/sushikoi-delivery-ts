import { GeocodePrecision, LatLng } from '@/types';

export interface SmartGeocodeInput {
  street?: string; number?: string; sector?: string; city?: string;
}

export interface SmartGeocodeResult extends LatLng {
  precision: GeocodePrecision;
  matchedNumber: boolean;
}

const VIEWBOX_PM = '-73.2,-41.7,-72.7,-41.3';

export async function geocodeSmart(
  { street, number, sector, city }: SmartGeocodeInput,
): Promise<SmartGeocodeResult | null> {
  const cityName = city || 'Puerto Montt';
  const streetTrim = (street || '').trim();
  const numberTrim = (number || '').trim();
  if (!streetTrim) return null;

  const urls: string[] = [];

  if (numberTrim) {
    urls.push(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=cl&bounded=1&viewbox=${VIEWBOX_PM}&street=${encodeURIComponent(`${numberTrim} ${streetTrim}`)}&city=${encodeURIComponent(cityName)}&country=Chile&dedupe=1&extratags=1`,
    );
    if (sector?.trim()) {
      urls.push(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=cl&bounded=1&viewbox=${VIEWBOX_PM}&street=${encodeURIComponent(`${numberTrim} ${streetTrim}`)}&city=${encodeURIComponent(cityName)}&county=${encodeURIComponent(sector)}&country=Chile&dedupe=1&extratags=1`,
      );
    }
    urls.push(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=cl&bounded=1&viewbox=${VIEWBOX_PM}&street=${encodeURIComponent(streetTrim)}&city=${encodeURIComponent(cityName)}&country=Chile&dedupe=1&extratags=1`,
    );
  }

  const freeText = `${streetTrim} ${numberTrim ? numberTrim : ''}, ${sector ? sector + ', ' : ''}${cityName}, Los Lagos, Chile`;
  urls.push(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=cl&bounded=1&viewbox=${VIEWBOX_PM}&q=${encodeURIComponent(freeText)}&dedupe=1&extratags=1`,
  );
  urls.push(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=cl&bounded=1&viewbox=${VIEWBOX_PM}&q=${encodeURIComponent(`${streetTrim}, ${cityName}, Chile`)}&dedupe=1&extratags=1`,
  );

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'Accept-Language': 'es-CL' } });
      const data = (await res.json()) as any[];
      if (!Array.isArray(data) || data.length === 0) continue;

      const pick = (rec: any, precision: GeocodePrecision, matchedNumber = false): SmartGeocodeResult | null => {
        const lat = parseFloat(rec.lat), lng = parseFloat(rec.lon);
        return (isFinite(lat) && isFinite(lng)) ? { lat, lng, precision, matchedNumber } : null;
      };

      if (numberTrim) {
        const exact = data.find((r) => {
          const hn = r?.address?.house_number || r?.address?.housenumber;
          return hn && String(hn).trim() === numberTrim;
        });
        if (exact) {
          const ex = pick(exact, 'exact', true);
          if (ex) return ex;
        }
      }

      const sameRoad = data.find((r) => {
        const road = (r?.address?.road || '').toLowerCase();
        return road.includes(streetTrim.toLowerCase());
      });
      if (sameRoad) {
        const sr = pick(sameRoad, 'road', false);
        if (sr) return sr;
      }

      const fb = pick(data[0], 'fallback', false);
      if (fb) return fb;
    } catch { /* siguiente */ }
  }
  return null;
}
