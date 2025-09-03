// src/types/index.ts

/* ====== Básicos ====== */
export type Role = 'CAJERO' | 'COCINA' | 'DELIVERY' | 'ADMIN';

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';

/* ====== Dirección / Cliente ====== */
export interface Address {
  street: string;
  number?: string;
  city?: string;
  region?: string;
  lat: number;
  lng: number;
  reference?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: Address;
}

/* ====== Items y Orden ====== */
export interface OrderItem {
  id: string;           // SKU o interno
  name: string;
  qty: number;
  price: number;        // precio unitario
  notes?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',          // creada por cajero
  IN_KITCHEN = 'IN_KITCHEN',    // en preparación
  PACKING = 'PACKING',          // embalando (cronómetro)
  READY = 'READY',              // lista para retirar
  ON_ROUTE = 'ON_ROUTE',        // repartidor en camino
  DELIVERED = 'DELIVERED',      // entregada
  CANCELLED = 'CANCELLED'       // cancelada
}

export interface Order {
  id: string;                   // p.ej. 'ORD-2025-0001'
  customer: Customer;
  items: OrderItem[];
  total: number;                // calculado = sum(qty*price)
  status: OrderStatus;
  paymentMethod?: PaymentMethod;

  createdAt: string;            // ISO
  updatedAt: string;            // ISO

  // datos opcionales para delivery
  etaMinutes?: number;
  distanceMeters?: number;
  deliveryNotes?: string;
}
