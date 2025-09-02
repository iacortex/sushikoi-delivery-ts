export const isPhone = (v: string): boolean => /^\+?\d{7,15}$/.test(v.replace(/\s/g, ''));

export const isNonEmpty = (v?: string | null): boolean => !!v && v.trim().length > 0;
