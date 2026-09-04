import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const POLL_DELAY_MS = 2500;
const POLL_START_DELAY_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

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
  const [error, setError] = useState<string | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const clearPollingResources = useCallback(() => {
    for (const timeoutRef of [
      pollTimeoutRef,
      startTimeoutRef,
      expiryTimeoutRef,
    ]) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  const stopPolling = useCallback(() => {
    clearPollingResources();
    setPolling(false);
    setError(null);
    setToken(generateToken());
  }, [clearPollingResources]);

  useEffect(() => {
    return clearPollingResources;
  }, [clearPollingResources]);

  const onLinkClick = useCallback(() => {
    clearPollingResources();
    setError(null);
    setPolling(true);
    const activeToken = token;
    let consecutiveNetworkErrors = 0;

    const finishWithError = (message: string) => {
      clearPollingResources();
      setPolling(false);
      setError(message);
      setToken(generateToken());
    };

    const schedulePoll = (delay = POLL_DELAY_MS) => {
      pollTimeoutRef.current = setTimeout(() => {
        void poll();
      }, delay);
    };

    const poll = async () => {
      const controller = new AbortController();
      requestRef.current = controller;
      try {
        const response = await fetch("/api/auth-poll", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: activeToken }),
          signal: controller.signal,
        });
        requestRef.current = null;

        if (response.status === 200) {
          const payload = (await response.json()) as { user?: unknown };
          const user = payload.user as Parameters<typeof login>[0] | undefined;
          if (user?.id) {
            login(user);
            clearPollingResources();
            setPolling(false);
            setToken(generateToken());
            return;
          }
          finishWithError("invalid_response");
          return;
        }

        if (response.status === 202) {
          consecutiveNetworkErrors = 0;
          schedulePoll();
          return;
        }

        if (response.status === 429) {
          schedulePoll(10_000);
          return;
        }

        finishWithError("unavailable");
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        requestRef.current = null;
        consecutiveNetworkErrors += 1;
        if (consecutiveNetworkErrors >= 3) setError("network");
        schedulePoll(Math.min(10_000, POLL_DELAY_MS * consecutiveNetworkErrors));
      }
    };

    startTimeoutRef.current = setTimeout(() => {
      void poll();
    }, POLL_START_DELAY_MS);
    expiryTimeoutRef.current = setTimeout(() => {
      finishWithError("timeout");
    }, POLL_TIMEOUT_MS);
  }, [token, login, clearPollingResources]);

  return {
    loginUrl: `https://t.me/himalayan_retreat_bot?start=login_${token}`,
    onLinkClick,
    polling,
    error,
    cancel: stopPolling,
  };
}
