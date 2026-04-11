import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  clearStoredSession,
  readStoredSession,
  sessionStorageEvents,
  writeStoredSession
} from '@/lib/storage';
import type { AuthSession, LoginPayload, RegistrationPayload, UserProfile } from '@/types/api';

type AuthContextValue = {
  session: AuthSession | null;
  user: UserProfile | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<UserProfile>;
  register: (payload: RegistrationPayload) => Promise<UserProfile>;
  logout: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const handleSessionChange = (event: Event) => {
      const customEvent = event as CustomEvent<AuthSession | null>;
      setSession(customEvent.detail);
    };

    window.addEventListener(sessionStorageEvents.name, handleSessionChange as EventListener);

    return () => {
      window.removeEventListener(sessionStorageEvents.name, handleSessionChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = readStoredSession();
      if (!stored) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const user = await api.auth.me();
        writeStoredSession({ ...stored, user });
      } catch {
        clearStoredSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const nextSession = await api.auth.login(payload);
    writeStoredSession(nextSession);
    return nextSession.user;
  }, []);

  const register = useCallback(async (payload: RegistrationPayload) => {
    const nextSession = await api.auth.register(payload);
    writeStoredSession(nextSession);
    return nextSession.user;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    queryClient.clear();
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    const stored = readStoredSession();
    if (!stored) {
      return null;
    }

    const user = await api.auth.me();
    writeStoredSession({ ...stored, user });
    return user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isBootstrapping,
      isAuthenticated: Boolean(session?.accessToken),
      login,
      register,
      logout,
      refreshProfile
    }),
    [isBootstrapping, login, logout, refreshProfile, register, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
