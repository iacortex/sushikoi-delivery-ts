import { LatLng } from '@/types';

export default function AddressMap({ value }: { value?: LatLng | null }) {
  if (!value) return <div className="h-48 rounded-md bg-gray-50 grid place-items-center text-gray-400">Mapa pendiente</div>;
  return (
    <div className="h-48 rounded-md bg-gray-100 grid place-items-center text-gray-500">
      ({value.lat.toFixed(5)}, {value.lng.toFixed(5)})
    </div>
  );
}
