import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

function generateToken(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Shared Telegram login flow. `loginUrl` is meant for a real <a href>
 * (not window.open) so mobile browsers treat the tap as a trusted,
 * same-tab navigation and hand off straight to the Telegram app via
 * its universal/app link instead of opening an extra browser tab that
 * then asks to open Telegram. `onLinkClick` starts the poll against
 * /api/auth-poll without blocking that navigation.
 */
export function useTelegramLogin() {
  const { login } = useAuth();
  const [polling, setPolling] = useState(false);
  const [token, setToken] = useState(generateToken);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
    setToken(generateToken());
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const onLinkClick = useCallback(() => {
    setPolling(true);

    const startPolling = () => {
      intervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/auth-poll?token=${token}`);
          if (res.status === 200) {
            const user = await res.json();
            if (user && user.id) {
              login(user);
              stopPolling();
            }
          }
          // 202 = pending, keep polling
        } catch {
          // Network error, keep trying
        }
      }, 2000);
    };

    setTimeout(startPolling, 3000);
    setTimeout(() => stopPolling(), 300000);
  }, [token, login, stopPolling]);

  return {
    loginUrl: `https://t.me/himalayan_retreat_bot?start=login_${token}`,
    onLinkClick,
    polling,
    cancel: stopPolling,
  };
}
