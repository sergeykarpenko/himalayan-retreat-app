import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  paid?: boolean;
  provider?: "telegram" | "apple";
  provider_user_id?: string;
}

interface AuthContextType {
  user: TelegramUser | null;
  loading: boolean;
  login: (userData: TelegramUser) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PROFILE_CACHE_KEY = "tg_profile";

function sanitizeProfile(value: unknown): TelegramUser | null {
  if (!value || typeof value !== "object") return null;
  const parsed = value as Record<string, unknown>;
  if (
    typeof parsed.id !== "number" ||
    typeof parsed.first_name !== "string" ||
    typeof parsed.auth_date !== "number"
  ) {
    return null;
  }
  return {
    id: parsed.id,
    first_name: parsed.first_name,
    last_name: typeof parsed.last_name === "string" ? parsed.last_name : undefined,
    username: typeof parsed.username === "string" ? parsed.username : undefined,
    photo_url: typeof parsed.photo_url === "string" ? parsed.photo_url : undefined,
    auth_date: parsed.auth_date,
    paid: parsed.paid === true,
    provider: parsed.provider === "apple" ? "apple" : "telegram",
    provider_user_id:
      typeof parsed.provider_user_id === "string"
        ? parsed.provider_user_id
        : String(parsed.id),
  };
}

function loadCachedProfile(): TelegramUser | null {
  try {
    // A cached profile avoids a UI flash. It is never an authorization source:
    // the paid flag is deliberately discarded and every protected request is
    // checked against the signed HttpOnly server session.
    const raw =
      localStorage.getItem(PROFILE_CACHE_KEY) ||
      localStorage.getItem("tg_user");
    if (!raw) return null;
    const profile = sanitizeProfile(JSON.parse(raw));
    return profile ? { ...profile, paid: false } : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(loadCachedProfile);
  const [loading, setLoading] = useState(true);

  const cacheProfile = useCallback((userData: TelegramUser | null) => {
    localStorage.removeItem("tg_user");
    if (!userData) {
      localStorage.removeItem(PROFILE_CACHE_KEY);
      return;
    }
    const profile = {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      photo_url: userData.photo_url,
      auth_date: userData.auth_date,
      provider: userData.provider,
      provider_user_id: userData.provider_user_id,
    };
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/session", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        cacheProfile(null);
        setUser(null);
        return false;
      }
      const payload = (await response.json()) as { user?: unknown };
      const sessionUser = sanitizeProfile(payload.user);
      if (!sessionUser) {
        cacheProfile(null);
        setUser(null);
        return false;
      }
      cacheProfile(sessionUser);
      setUser(sessionUser);
      return true;
    } catch {
      // Keep the non-authoritative cached profile for offline UI only.
      return false;
    } finally {
      setLoading(false);
    }
  }, [cacheProfile]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshSession();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [refreshSession]);

  const login = useCallback((userData: TelegramUser) => {
    const sessionUser = sanitizeProfile(userData);
    if (!sessionUser) return;
    cacheProfile(sessionUser);
    setUser(sessionUser);
  }, [cacheProfile]);

  const logout = useCallback(async () => {
    cacheProfile(null);
    setUser(null);
    try {
      const operations: Promise<unknown>[] = [
        fetch("/api/session", {
          method: "DELETE",
          credentials: "same-origin",
        }),
      ];
      if (typeof caches !== "undefined") {
        operations.push(caches.delete("audio-cache"));
      }
      await Promise.allSettled(operations);
    } catch {
      // Local logout already completed. Server cookie expires independently.
    }
  }, [cacheProfile]);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshSession }),
    [user, loading, login, logout, refreshSession],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
