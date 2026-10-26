import { useEffect, useState } from "react";

/**
 * Данные о ближайшем потоке — с сайта, через свой же /api/retreat.
 *
 * Запрос идёт на собственный origin: CSP приложения держит connect-src 'self',
 * да и ходить в чужой домен из браузера незачем. Серверная часть
 * (functions/api/retreat.ts) забирает данные с himalayanholytemple.net и
 * нормализует их.
 *
 * ОБНОВЛЕНИЕ — РАЗ В СУТКИ: приложение живёт как PWA, открытую вкладку не
 * перезагружают неделями, и без этого данные остались бы такими, какими были в
 * день открытия. Сутки — тот же срок, что у серверной части.
 *
 * FAIL-CLOSED: пока данных нет или они не пришли — known остаётся false, и
 * интерфейс не называет никаких дат. До 04.10.2026 приложение в этом случае
 * показывало вшитую дату закончившегося потока.
 */

const REFRESH_MS = 86_400_000;

export interface RetreatInfo {
  known: true;
  id: string;
  format: string;
  startDate: string;
  endDate: string;
  dates: { ru: string; en: string };
  durationDays: number | null;
  capacity: number | null;
  spotsLeft: number;
  /** null — «цена по запросу». Показывать нулём нельзя. */
  priceUsd: number | null;
  priceNote: { ru: string; en: string };
  /** Принадлежит ли распорядок в приложении именно этому потоку. */
  programmeMatches: boolean;
}

export type RetreatState =
  | { status: "loading" }
  | { status: "unknown" }
  | { status: "ready"; retreat: RetreatInfo };

export function useRetreat(): RetreatState {
  const [state, setState] = useState<RetreatState>({ status: "loading" });

  useEffect(() => {
    const ctl = new AbortController();
    let loadedAt = 0;

    const load = () => {
      fetch("/api/retreat", { signal: ctl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          loadedAt = Date.now();
          if (data && data.known === true) {
            setState({ status: "ready", retreat: data as RetreatInfo });
          } else {
            // Это ответ сервера, а не сбой: поток закрылся или ещё не объявлен.
            setState({ status: "unknown" });
          }
        })
        .catch(() => {
          // Отмена размонтированием — не ошибка, но и состояние менять нечему.
          if (ctl.signal.aborted) return;
          // Неудачное обновление не стирает то, что уже показано: сеть моргнула
          // — не повод убирать даты с открытой страницы.
          setState((prev) => (prev.status === "ready" ? prev : { status: "unknown" }));
        });
    };

    load();
    const timer = window.setInterval(load, REFRESH_MS);

    // Телефон усыпляет вкладку, и за сутки setInterval может не сработать ни
    // разу. Поэтому ещё и при возврате к приложению — но только если данным
    // действительно сутки, а не на каждое переключение окна.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - loadedAt >= REFRESH_MS) load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      ctl.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return state;
}
