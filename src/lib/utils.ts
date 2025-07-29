import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para limpar dados do Firestore antes de enviar para Client Components
export function cleanFirestoreData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(cleanFirestoreData);
  if (typeof obj === 'object') {
    // Trata Firestore Timestamp puro
    if (
      Object.keys(obj).length === 2 &&
      typeof obj._seconds === 'number' &&
      typeof obj._nanoseconds === 'number'
    ) {
      const date = new Date(obj._seconds * 1000 + Math.floor(obj._nanoseconds / 1e6));
      return date.toISOString();
    }
    // Trata objetos com .toDate()
    if (typeof obj.toDate === 'function') {
      return obj.toDate().toISOString();
    }
    // Limpa recursivamente
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = cleanFirestoreData(v);
    }
    return out;
  }
  return obj;
}

// Função para converter Timestamp para string ISO de forma segura
export function timestampToISO(timestamp: any): string | undefined {
  if (!timestamp) return undefined;
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  // Novo: trata também o formato {_seconds, _nanoseconds}
  if (
    typeof timestamp === 'object' &&
    typeof timestamp._seconds === 'number' &&
    typeof timestamp._nanoseconds === 'number'
  ) {
    const date = new Date(timestamp._seconds * 1000 + Math.floor(timestamp._nanoseconds / 1e6));
    return date.toISOString();
  }
  return undefined;
}

// Função específica para limpar UserProfile
export function cleanUserProfile(profile: any): any {
  if (!profile) return profile;

  const toISO = (ts: any): string | undefined => {
    if (!ts) return undefined;
    if (typeof ts === 'string') return ts;
    if (ts && typeof ts === 'object' && 'toDate' in ts && typeof ts.toDate === 'function') {
      return ts.toDate().toISOString();
    }
    if (
      typeof ts === 'object' &&
      typeof ts._seconds === 'number' &&
      typeof ts._nanoseconds === 'number'
    ) {
      const date = new Date(ts._seconds * 1000 + Math.floor(ts._nanoseconds / 1e6));
      return date.toISOString();
    }
    return undefined;
  };

  return {
    ...profile,
    createdAt: toISO(profile.createdAt) || new Date().toISOString(),
    cnhExpiration: toISO(profile.cnhExpiration),
    condutaxExpiration: toISO(profile.condutaxExpiration),
    alvaraExpiration: toISO(profile.alvaraExpiration),
    lastNotificationCheck: toISO(profile.lastNotificationCheck),
    lastSeekingRentalsCheck: toISO(profile.lastSeekingRentalsCheck),
    sessionValidSince: toISO(profile.sessionValidSince),
  };
}
