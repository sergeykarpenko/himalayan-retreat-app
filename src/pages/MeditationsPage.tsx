import { Headphones, Clock, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { meditations } from "@/data/meditations";

export function MeditationsPage() {
  const { t, language } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-light tracking-widest uppercase mb-2">
          {t("Meditations", "Медитации")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t(
            "Audio guides will be available during the retreat",
            "Аудио-гайды будут доступны во время ретрита"
          )}
        </p>
      </div>

      <div className="px-4 pb-8 space-y-3">
        {meditations.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 opacity-70"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {track.title[language]}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {track.category[language]}
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs font-mono">{track.duration}</span>
              <Lock className="h-3 w-3 ml-1" />
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t(
              "Audio content will be unlocked at the retreat",
              "Аудиоконтент будет доступен на ретрите"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
