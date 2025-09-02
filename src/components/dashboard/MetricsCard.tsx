export default function MetricsCard({
  title,
  value,
  hint
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="p-4 rounded-lg border bg-white">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-black">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
