import { Address } from '@/types';

export default function AddressMap({ address }: { address?: Address | null }) {
  if (!address?.location) {
    return (
      <div className="h-48 rounded-md bg-gray-50 grid place-items-center text-gray-400">
        Mapa pendiente
      </div>
    );
  }

  return (
    <div className="h-48 rounded-md bg-gray-100 grid place-items-center text-gray-500">
      {address.displayName} ({address.location.lat.toFixed(5)}, {address.location.lng.toFixed(5)})
    </div>
  );
}
