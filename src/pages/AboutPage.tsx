import { Link } from "react-router-dom";
import { Mountain, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { aboutText, teachers } from "@/data/about";

export function AboutPage() {
  const { language } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Mountain className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-light tracking-widest uppercase">
              {aboutText.title[language]}
            </h2>
            <p className="text-xs text-muted-foreground">
              {aboutText.subtitle[language]}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground/80">
          {aboutText.description[language]}
        </p>
      </div>

      <div className="px-4 pb-6">
        <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
          {language === "en" ? "Our Team" : "Наша команда"}
        </h3>
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.name.en}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                  {teacher.name[language][0]}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {teacher.name[language]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {teacher.role[language]}
                  </p>
                </div>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed">
                {teacher.bio[language]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">
        <Link
          to="/contact"
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          {language === "en" ? "Get in Touch" : "Связаться"}
        </Link>
      </div>
    </div>
  );
}
