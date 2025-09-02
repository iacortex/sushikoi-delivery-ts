import { useEffect, useState } from 'react';

/** Devuelve el valor con un retardo (debounce) */
export function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
