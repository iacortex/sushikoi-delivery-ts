import { useState } from 'react';
import Header from '@/components/layout/Header';
import RoleSelector from '@/components/layout/RoleSelector';
import TabNavigation from '@/components/layout/TabNavigation';
import Dashboard from '@/components/dashboard/Dashboard';
import CustomerForm from '@/components/forms/CustomerForm';
import AddressMap from '@/components/maps/AddressMap';
import { Role } from '@/types';

export default function App() {
  const [role, setRole] = useState<Role>('CAJERO');
  const [tab, setTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Panel {role}</h1>
          <RoleSelector value={role} onChange={setRole} />
        </div>

        <TabNavigation
          value={tab}
          onChange={setTab}
          tabs={[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'clientes', label: 'Clientes' },
            { key: 'pedidos', label: 'Pedidos' }
          ]}
        />

        {tab === 'dashboard' && <Dashboard />}
        {tab === 'clientes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerForm onSubmit={() => { /* TODO: integrar storage + flujo */ }} />
            <AddressMap address={undefined} />
          </div>
        )}
        {tab === 'pedidos' && (
          <div className="text-sm text-gray-500">Listado de pedidos (pendiente)</div>
        )}
      </main>
    </div>
  );
}
