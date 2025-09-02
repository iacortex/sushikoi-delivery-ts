import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sushi-600">
      <Loader2 className="animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
