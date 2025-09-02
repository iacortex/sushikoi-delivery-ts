export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
export const REVERSE_URL   = 'https://nominatim.openstreetmap.org/reverse';
export const OSRM_URL      = 'https://router.project-osrm.org/route/v1';

export const STORAGE_KEYS = {
  CUSTOMERS: 'sushikoi.customers',
  ORDERS: 'sushikoi.orders',
  PROMOS: 'sushikoi.promotions'
} as const;

export const CLP_FORMATTER = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
