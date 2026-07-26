import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getApproachIntensity } from "@/lib/retreatCountdown";

/**
 * Ambient pyramid horizon, dark theme only. The apex glow is the temple's
 * future capstone and the neural network's data-center core in one image —
 * its intensity rises as the September retreat approaches, so the backdrop
 * itself quietly tracks the countdown.
 */
export function PyramidBackdrop() {
  const { t } = useLanguage();
  const intensity = useMemo(() => getApproachIntensity(), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden dark:block"
      style={{ ["--pyramid-intensity" as string]: intensity }}
    >
      <div
        className="absolute inset-x-0 top-[14vh] flex flex-col items-center gap-1 leading-[0.82] text-accent"
        style={{ opacity: `calc(var(--pyramid-intensity) * 0.24)` }}
      >
        <span className="w-full text-center font-extralight uppercase tracking-tighter text-[26vw]">
          {t("Start", "Старт")}
        </span>
        <span className="w-full text-center font-extralight tracking-tighter text-[26vw]">
          2026
        </span>
      </div>

      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMax meet"
        className="absolute bottom-0 left-0 h-[56vh] w-full"
      >
        <defs>
          <radialGradient id="pyramid-glow" cx="50%" cy="100%" r="55%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle
          cx="200"
          cy="120"
          r="85"
          fill="url(#pyramid-glow)"
          className="pyramid-glow"
          style={{ filter: "blur(16px)" }}
        />

        <polygon
          points="40,380 200,120 360,380"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="1.2"
          strokeOpacity="0.22"
        />
        <line
          x1="200"
          y1="120"
          x2="228"
          y2="380"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          strokeOpacity="0.13"
        />

        <line x1="96" y1="290" x2="304" y2="290" stroke="hsl(var(--accent))" strokeWidth="0.75" strokeOpacity="0.08" />
        <line x1="128" y1="220" x2="272" y2="220" stroke="hsl(var(--accent))" strokeWidth="0.75" strokeOpacity="0.08" />
        <line x1="160" y1="160" x2="240" y2="160" stroke="hsl(var(--accent))" strokeWidth="0.75" strokeOpacity="0.08" />
      </svg>
    </div>
  );
}
