// Tipos base del dominio SushiKoi
export type UUID = string;

export type Role = 'CAJERO' | 'COCINERO' | 'DELIVERY';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Address {
  raw: string;              // input del usuario
  displayName?: string;     // formateado por Nominatim
  houseNumber?: string;     // número si existe
  street?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  location?: LatLng;        // coordenadas exactas
  confidence: 'exact' | 'approx' | 'manual';
  source: 'nominatim' | 'cache' | 'manual';
}

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'WEBPAY';
export type PaymentStatus  = 'PENDIENTE' | 'PAGADO' | 'RECHAZADO' | 'REEMBOLSADO';

export interface Payment {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;          // CLP
  reference?: string;      // folio, transbank token, etc.
}

export interface Customer {
  id: UUID;
  name: string;
  phone?: string;
  email?: string;
  address: Address;
  notes?: string;
}

export type OrderStatus =
  | 'CREADO'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'LISTO_EMBALAJE'
  | 'EN_REPARTO'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number; // CLP
}

export interface RouteInfo {
  distanceMeters: number;
  durationSeconds: number;
  geometry?: string; // polyline
}

export interface Order {
  id: UUID;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status: OrderStatus;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: Payment;
  kitchenEtaSec?: number;   // estimado cocina
  route?: RouteInfo;        // OSRM
  navQrUrl?: string;        // QR a GMaps/Waze
}

export interface Promotion {
  id: UUID;
  title: string;
  description?: string;
  active: boolean;
  validFrom?: string; // ISO
  validTo?: string;   // ISO
  discountPercent?: number;
  fixedAmountOff?: number;
}
