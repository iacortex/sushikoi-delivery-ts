import { STORAGE_KEYS } from '@/utils';
import { Customer, Order, Promotion } from '@/types';

/** Simple wrapper sobre localStorage con claves namespaced */
export const storage = {
  // Customers
  getCustomers(): Customer[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
  },
  setCustomers(v: Customer[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(v));
  },

  // Orders
  getOrders(): Order[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  },
  setOrders(v: Order[]) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(v));
  },

  // Promotions
  getPromos(): Promotion[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMOS) || '[]');
  },
  setPromos(v: Promotion[]) {
    localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(v));
  }
};
