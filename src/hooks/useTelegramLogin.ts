import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

function generateToken(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Shared Telegram login flow: opens the bot deep link, then polls
 * /api/auth-poll until the user confirms in Telegram. Used by
 * TelegramLoginButton and any other guest-facing "sign in" trigger.
 */
export function useTelegramLogin() {
  const { login } = useAuth();
  const [polling, setPolling] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
    tokenRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const trigger = useCallback(() => {
    const token = generateToken();
    tokenRef.current = token;
    setPolling(true);

    // Open Telegram deep link in new window (keep PWA page for polling)
    window.open(`https://t.me/himalayan_retreat_bot?start=login_${token}`, "_blank");

    const startPolling = () => {
      intervalRef.current = setInterval(async () => {
        if (!tokenRef.current) return;
        try {
          const res = await fetch(`/api/auth-poll?token=${tokenRef.current}`);
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
  }, [login, stopPolling]);

  return { trigger, polling, cancel: stopPolling };
}
