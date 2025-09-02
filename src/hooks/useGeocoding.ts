import { useCallback, useState } from 'react';
import { Address, LatLng } from '@/types';
import { geocodeExact, reverseGeocode } from '@/services/geocoding';

/** Geocoding + reverse con estados de carga/error */
export function useGeocoding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (query: string, cityHint?: string) => {
    setLoading(true); setError(null);
    try {
      const addr = await geocodeExact(query, cityHint);
      return addr;
    } catch {
      setError('No se pudo geocodificar la dirección');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverse = useCallback(async (latlng: LatLng) => {
    setLoading(true); setError(null);
    try {
      return await reverseGeocode(latlng);
    } catch {
      setError('No se pudo obtener la dirección');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { geocode, reverse, loading, error };
}
