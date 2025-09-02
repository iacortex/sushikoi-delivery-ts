import MetricsCard from './MetricsCard';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricsCard title="Ventas hoy" value="$0" hint="Total bruto" />
      <MetricsCard title="Pedidos" value="0" hint="Últimas 24h" />
      <MetricsCard title="Ticket prom." value="$0" />
      <MetricsCard title="Tiempo entrega" value="—" hint="Mediana" />
    </div>
  );
}
