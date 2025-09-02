import { AlertTriangle } from 'lucide-react';

export default function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
      <AlertTriangle className="mt-0.5" />
      <div>
        <p className="font-medium">Ups, algo pasó</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
