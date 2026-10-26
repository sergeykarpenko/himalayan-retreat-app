import { useEffect, useState } from "react";

/**
 * Данные о ближайшем потоке — с сайта, через свой же /api/retreat.
 *
 * Запрос идёт на собственный origin: CSP приложения держит connect-src 'self',
 * да и ходить в чужой домен из браузера незачем. Серверная часть
 * (functions/api/retreat.ts) забирает данные с himalayanholytemple.net и
 * нормализует их.
 *
 * FAIL-CLOSED: пока данных нет или они не пришли — known остаётся false, и
 * интерфейс не называет никаких дат. До 04.10.2026 приложение в этом случае
 * показывало вшитую дату закончившегося потока.
 */

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

    fetch("/api/retreat", { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.known === true) {
          setState({ status: "ready", retreat: data as RetreatInfo });
        } else {
          setState({ status: "unknown" });
        }
      })
      .catch(() => {
        // Отмена размонтированием — не ошибка, но и состояние менять нечему.
        if (!ctl.signal.aborted) setState({ status: "unknown" });
      });

    return () => ctl.abort();
  }, []);

  return state;
}
