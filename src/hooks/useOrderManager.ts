import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Order, OrderStatus, OrderItem } from '@/types';

/* ================== Constantes & Storage Keys ================== */
const STORAGE_ORDERS = 'orders';
const STORAGE_PACKING = 'orders_packing_timers';
const PACKING_SECONDS = 90; // 1:30

/* ================== Utils ================== */
function calcTotal(items: OrderItem[]): number {
  return items.reduce((acc, it) => acc + it.qty * it.price, 0);
}

function isoNow(): string {
  return new Date().toISOString();
}

function normalizeLegacyStatus(s: string): OrderStatus {
  switch (s) {
    case 'CREADO':
      return OrderStatus.PENDING;
    case 'COCINA':
      return OrderStatus.IN_KITCHEN;
    case 'EMPAQUE':
      return OrderStatus.PACKING;
    case 'LISTO':
      return OrderStatus.READY;
    case 'RUTA':
      return OrderStatus.ON_ROUTE;
    case 'ENTREGADO':
      return OrderStatus.DELIVERED;
    case 'CANCELADO':
      return OrderStatus.CANCELLED;
    default:
      // Si ya es un valor válido de OrderStatus, úsalo
      if (Object.values(OrderStatus).includes(s as OrderStatus)) {
        return s as OrderStatus;
      }
      return OrderStatus.PENDING;
  }
}

/** Carga segura desde localStorage */
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* ================== Hook ================== */
export function useOrderManager() {
  /** Lista de órdenes (persistida) */
  const [orders, setOrders] = useState<Order[]>(() => {
    const raw = loadJSON<any[]>(STORAGE_ORDERS, []);
    return raw.map((o) => ({
      ...o,
      status: normalizeLegacyStatus(o.status),
    })) as Order[];
  });

  /**
   * Timers de empaque (persistidos): { [orderId]: epochMillisFin }
   * Mantenemos esto separado para no tocar la interfaz Order.
   */
  const [packingTimers, setPackingTimers] = useState<Record<string, number>>(
    () => loadJSON<Record<string, number>>(STORAGE_PACKING, {})
  );

  /** Reloj interno para refrescar UI de cronómetros */
  const [, forceTick] = useState(0);
  const tickRef = useRef<number | null>(null);

  /* ============ Persistencia ============ */
  useEffect(() => {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PACKING, JSON.stringify(packingTimers));
  }, [packingTimers]);

  /* ============ Intervalo para cronómetro y auto-avance READY ============ */
  useEffect(() => {
    if (tickRef.current != null) return; // ya corriendo
    tickRef.current = window.setInterval(() => {
      const now = Date.now();
      let changed = false;
      const newTimers: Record<string, number> = { ...packingTimers };
      let newOrders = orders;

      // Avanza automáticamente a READY si terminó PACKING
      Object.entries(packingTimers).forEach(([orderId, endMs]) => {
        if (now >= endMs) {
          // Avanzar a READY
          newOrders = newOrders.map((o) =>
            o.id === orderId && o.status === OrderStatus.PACKING
              ? { ...o, status: OrderStatus.READY, updatedAt: isoNow() }
              : o
          );
          delete newTimers[orderId];
          changed = true;
        }
      });

      if (changed) {
        setOrders(newOrders);
        setPackingTimers(newTimers);
      }

      // Dispara re-render para actualizar los segundos restantes
      forceTick((n) => n + 1);
    }, 500);

    return () => {
      if (tickRef.current != null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
    // Intencional: dependencias vacías — el intervalo maneja cambios internos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, packingTimers]);

  /* ============ Derivados ============ */
  const byStatus = useMemo<Record<OrderStatus, Order[]>>(() => {
    return orders.reduce(
      (acc, o) => {
        acc[o.status].push(o);
        return acc;
      },
      {
        [OrderStatus.PENDING]: [] as Order[],
        [OrderStatus.IN_KITCHEN]: [] as Order[],
        [OrderStatus.PACKING]: [] as Order[],
        [OrderStatus.READY]: [] as Order[],
        [OrderStatus.ON_ROUTE]: [] as Order[],
        [OrderStatus.DELIVERED]: [] as Order[],
        [OrderStatus.CANCELLED]: [] as Order[],
      }
    );
  }, [orders]);

  /* ============ Acciones ============ */
  type CreateOrderInput = Omit<
    Order,
    'id' | 'total' | 'status' | 'createdAt' | 'updatedAt'
  > & {
    id?: string; // si quieres forzar ID propio
    status?: OrderStatus; // default PENDING
  };

  const createOrder = useCallback((data: CreateOrderInput): Order => {
    const id =
      data.id ??
      `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math
        .random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`;

    const total = calcTotal(data.items);
    const now = isoNow();

    const order: Order = {
      id,
      customer: data.customer,
      items: data.items,
      total,
      status: data.status ?? OrderStatus.PENDING,
      paymentMethod: data.paymentMethod,
      createdAt: now,
      updatedAt: now,
      etaMinutes: data.etaMinutes,
      distanceMeters: data.distanceMeters,
      deliveryNotes: data.deliveryNotes,
    };

    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const updateOrder = useCallback(
    (id: string, patch: Partial<Omit<Order, 'id' | 'createdAt'>>): void => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                ...patch,
                // Si cambian items, recalcular total
                total: patch.items ? calcTotal(patch.items) : o.total,
                updatedAt: isoNow(),
              }
            : o
        )
      );
    },
    []
  );

  const setStatus = useCallback((id: string, status: OrderStatus): void => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: isoNow() } : o
      )
    );

    // Si sales de PACKING, cancelar timer
    if (status !== OrderStatus.PACKING) {
      setPackingTimers((prev) => {
        if (!prev[id]) return prev;
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  const removeOrder = useCallback((id: string): void => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setPackingTimers((prev) => {
      if (!prev[id]) return prev;
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAll = useCallback(() => {
    setOrders([]);
    setPackingTimers({});
  }, []);

  /* ============ Packing timers (1:30) ============ */
  const startPacking = useCallback((id: string): void => {
    // Cambia estado a PACKING
    setStatus(id, OrderStatus.PACKING);

    // Setea fin en 90 segundos
    const endMs = Date.now() + PACKING_SECONDS * 1000;
    setPackingTimers((prev) => ({ ...prev, [id]: endMs }));
  }, [setStatus]);

  const cancelPacking = useCallback((id: string): void => {
    // Mantiene el estado actual (por si quieres quedarte en PACKING sin timer, puedes ajustar aquí)
    setPackingTimers((prev) => {
      if (!prev[id]) return prev;
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const getPackingRemaining = useCallback((id: string): number => {
    const endMs = packingTimers[id];
    if (!endMs) return 0;
    const diff = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
    return diff;
  }, [packingTimers]);

  return {
    /* estado */
    orders,
    byStatus,

    /* acciones */
    createOrder,
    updateOrder,
    setStatus,
    removeOrder,
    clearAll,

    /* packing (1:30) */
    startPacking,
    cancelPacking,
    getPackingRemaining,

    /* constantes útiles */
    PACKING_SECONDS,
  };
}

/* ================== (Opcional) Etiquetas en español ================== */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'CREADO',
  [OrderStatus.IN_KITCHEN]: 'COCINA',
  [OrderStatus.PACKING]: 'EMPAQUE',
  [OrderStatus.READY]: 'LISTO',
  [OrderStatus.ON_ROUTE]: 'RUTA',
  [OrderStatus.DELIVERED]: 'ENTREGADO',
  [OrderStatus.CANCELLED]: 'CANCELADO',
};
