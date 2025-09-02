import { Role } from '@/types';

const ROLES: { key: Role; label: string }[] = [
  { key: 'CAJERO', label: 'Cajero' },
  { key: 'COCINERO', label: 'Cocinero' },
  { key: 'DELIVERY', label: 'Delivery' }
];

export default function RoleSelector({
  value,
  onChange
}: {
  value: Role;
  onChange: (r: Role) => void;
}) {
  return (
    <div className="flex gap-2">
      {ROLES.map(r => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={`px-3 py-2 rounded-md border text-sm ${
            value === r.key
              ? 'bg-sushi-600 text-white border-sushi-700'
              : 'bg-white border-gray-200'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
