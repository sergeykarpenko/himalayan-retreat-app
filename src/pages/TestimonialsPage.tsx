import { Star, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { testimonials } from "@/data/testimonials";

export function TestimonialsPage() {
  const { t, language } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Star className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-light tracking-widest uppercase">
              {t("Testimonials", "Отзывы")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("Stories from our participants", "Истории наших участников")}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {testimonials.map((item) => (
            <a
              key={item.id}
              href={`https://youtube.com/watch?v=${item.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="relative shrink-0 w-36 h-20 rounded-xl overflow-hidden bg-muted">
                <img
                  src={`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`}
                  alt={item.name[language]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/40">
                  <Play className="h-8 w-8 text-white fill-white/90" />
                </div>
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-sm font-medium truncate">
                  {item.name[language]}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {item.topic[language]}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
