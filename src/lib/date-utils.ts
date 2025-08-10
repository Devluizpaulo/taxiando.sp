import { Timestamp } from 'firebase/firestore';

export function toDate(value: string | Date | Timestamp | { toDate?: () => Date } | undefined | null): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  if (typeof value === 'object' && value !== null && typeof (value as any).toDate === 'function') return (value as any).toDate();
  throw new Error('Valor de data inválido: ' + JSON.stringify(value));
}
