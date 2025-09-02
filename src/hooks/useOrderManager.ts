import { useMemo, useState } from 'react';
import { Order, OrderStatus } from '@/types';
import { storage } from '@/services/storage';

/**
 * Gestor de pedidos en memoria + persistencia localStorage.
 * Incluye helpers: add, remove, setStatus y agrupación por estado.
 */
export function useOrderManager() {
  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders());

  const persist = (next: Order[]) => { setOrders(next); storage.setOrders(next); };

  const add = (order: Order) => persist([order, ...orders]);
  const remove = (id: string) => persist(orders.filter(o => o.id !== id));
  const setStatus = (id: string, status: OrderStatus) =>
    persist(orders.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o));

  const byStatus = useMemo(() => {
    const g: Record<OrderStatus, Order[]> = {
      CREADO: [], CONFIRMADO: [], EN_PREPARACION: [], LISTO_EMBALAJE: [],
      EN_REPARTO: [], ENTREGADO: [], CANCELADO: []
    };
    for (const o of orders) g[o.status].push(o);
    return g;
  }, [orders]);

  return { orders, add, remove, setStatus, byStatus };
}
