import type { AuthSession } from '@/types/api';

const storageKey = 'smart-canteen.session';
const sessionEventName = 'smart-canteen:session';

const emitSessionChange = (session: AuthSession | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<AuthSession | null>(sessionEventName, { detail: session }));
};

export const readStoredSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

export const writeStoredSession = (session: AuthSession) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(session));
  emitSessionChange(session);
};

export const clearStoredSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(storageKey);
  emitSessionChange(null);
};

export const sessionStorageEvents = {
  name: sessionEventName
};
