import { Headphones, Clock, Lock, Send, Play, Pause, ExternalLink, BookOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/hooks/useAnalytics";
import { meditations, attunements, books, type Track, type Book } from "@/data/meditations";
import { TelegramLoginButton } from "@/components/shared/TelegramLoginButton";
import { BookContentGate } from "@/components/shared/BookContentGate";
import { AppleLoginButton } from "@/components/shared/AppleLoginButton";

function AudioTrack({ track, language, activeTrackId, onPlay, onStop }: { track: Track; language: "en" | "ru"; activeTrackId: string | null; onPlay: (id: string) => void; onStop: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playing = activeTrackId === track.id;

  // Pause when another track becomes active
  useEffect(() => {
    if (activeTrackId !== track.id) {
      audioRef.current?.pause();
    }
  }, [activeTrackId, track.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggle = async () => {
    setError(null);
    if (!audioRef.current) {
      audioRef.current = new Audio(track.audioUrl);
      audioRef.current.onended = onStop;
    }
    if (playing) {
      audioRef.current.pause();
      onStop();
    } else {
      onPlay(track.id);
      try {
        await audioRef.current.play();
        trackEvent("audio_play", {
          track_id: track.id,
          track_title: track.title.ru || track.title.en,
        });
      } catch {
        onStop();
        setError(
          language === "ru"
            ? "Не удалось воспроизвести"
            : "Playback failed",
        );
      }
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/55 backdrop-blur-md p-4">
      <button
        onClick={toggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors hover:bg-primary/20"
      >
        {playing ? (
          <Pause className="h-5 w-5 text-primary" />
        ) : (
          <Play className="h-5 w-5 text-primary ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {track.title[language]}
        </p>
        {error ? (
          <p className="text-xs text-destructive truncate" role="alert">
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground truncate">
            {track.category[language]}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span className="text-xs font-mono">{track.duration}</span>
      </div>
    </div>
  );
}

function DownloadAllButton({ tracks, language }: { tracks: Track[]; language: "en" | "ru" }) {
  void tracks;
  void language;
  return null;
}

const FREE_TRACKS = 2;
const FREE_ATTUNEMENTS = attunements.slice(0, FREE_TRACKS);
const PAID_ATTUNEMENTS = attunements.slice(FREE_TRACKS);

function LockedTrack({ track, language }: { track: Track; language: "en" | "ru" }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/55 backdrop-blur-md p-4 opacity-50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {track.title[language]}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {language === "ru" ? "Доступно участникам ретрита" : "Available for retreat participants"}
        </p>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span className="text-xs font-mono">{track.duration}</span>
      </div>
    </div>
  );
}

export function MeditationsPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [bookToOpen, setBookToOpen] = useState<Book | null>(null);
  const isPaid = user?.paid === true;

  if (!user) {
    return (
      <div className="animate-fade-in">
        <div className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-light tracking-widest uppercase mb-2">
            {t("Meditations", "Медитации")}
          </h2>
        </div>
        <div className="px-4 pb-8">
          <div className="rounded-2xl border border-border bg-card/55 backdrop-blur-md p-8 text-center space-y-5">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#2AABEE]/10">
              <Send className="h-8 w-8 text-[#2AABEE]" />
            </div>
            <div>
              <p className="text-base font-medium mb-1">
                {t(
                  "Sign in to unlock meditations, schedule and other features",
                  "Войдите, чтобы открыть медитации, расписание и другие функции"
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Quick sign-in via Telegram — no passwords needed",
                  "Быстрый вход через Telegram — без паролей"
                )}
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex w-full flex-col items-center gap-3">
                <TelegramLoginButton size="large" />
                {import.meta.env.VITE_APPLE_SIGN_IN_ENABLED === "true" && (
                  <>
                    <div className="flex w-full max-w-xs items-center gap-3 text-xs text-muted-foreground">
                      <span className="h-px flex-1 bg-border" />
                      {t("or", "или")}
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <AppleLoginButton />
                  </>
                )}
              </div>
            </div>
            <a
              href="https://t.me/himalayan_retreat_bot?start=book"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-primary"
            >
              <BookOpen className="h-4 w-4" />
              {t("Get books in Telegram", "Получить книги в Telegram")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const availableTracks = isPaid ? attunements : FREE_ATTUNEMENTS;

  const confirmBookOpen = () => {
    if (!bookToOpen?.downloadUrl) return;
    trackEvent("book_bot_open", {
      file_name: bookToOpen.id,
      link_url: bookToOpen.downloadUrl,
      content_type: "book",
    });
    window.open(bookToOpen.downloadUrl, "_blank", "noopener,noreferrer");
    setBookToOpen(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Медитации (бывшие сонастройки) — наверху */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-light tracking-widest uppercase mb-1">
            {t("Meditations", "Медитации")}
          </h2>
          <DownloadAllButton tracks={availableTracks} language={language} />
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {t(
            "Audio meditations by Olena Ruta",
            "Аудио-медитации от Олены Руты"
          )}
        </p>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {FREE_ATTUNEMENTS.map((track) => (
          <AudioTrack key={track.id} track={track} language={language} activeTrackId={activeTrackId} onPlay={setActiveTrackId} onStop={() => setActiveTrackId(null)} />
        ))}
        {isPaid
          ? PAID_ATTUNEMENTS.map((track) => (
              <AudioTrack key={track.id} track={track} language={language} activeTrackId={activeTrackId} onPlay={setActiveTrackId} onStop={() => setActiveTrackId(null)} />
            ))
          : PAID_ATTUNEMENTS.map((track) => (
              <LockedTrack key={track.id} track={track} language={language} />
            ))}
      </div>

      {/* Аудио-гайды (бывшие медитации) — внизу */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-lg font-light tracking-widest uppercase mb-1">
          {t("Audio Guides", "Аудио-гайды")}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {t(
            "Will be available during the retreat",
            "Будут доступны во время ретрита"
          )}
        </p>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {meditations.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card/55 backdrop-blur-md p-4 opacity-50"
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
      </div>

      {/* Книги */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-lg font-light tracking-widest uppercase mb-1">
          {t("Books", "Книги")}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {t("Books by our teachers", "Книги наших учителей")}
        </p>
        <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-amber-500">18+ · </span>
          {t(
            "Some materials discuss suicide, mental health, altered states and psychoactive substances. They are not medical advice.",
            "Некоторые материалы обсуждают суицид, психическое здоровье, изменённые состояния и психоактивные вещества. Они не являются медицинской рекомендацией.",
          )}
        </div>
        <p className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          {t("Books are delivered securely in our Telegram bot.", "Книги выдаются в нашем Telegram-боте.")}
          <ExternalLink className="h-3.5 w-3.5" />
        </p>
      </div>

      <div className="px-4 pb-8 space-y-3">
        {books.map((book) => {
          const canDownload = Boolean(user && book.available);
          const isComingSoon = !book.available;

          return (
            <button
              type="button"
              key={book.id}
              disabled={!canDownload}
              onClick={() => canDownload && setBookToOpen(book)}
              className={`flex w-full items-center gap-3 rounded-2xl border border-border bg-card/55 backdrop-blur-md p-4 text-left transition-colors ${isComingSoon ? "opacity-50" : ""} ${canDownload ? "active:bg-primary/5" : ""}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {book.title[language]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {book.author[language]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isComingSoon ? (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 py-0.5 rounded-full border border-border">
                    {t("Soon", "Скоро")}
                  </span>
                ) : canDownload ? (
                  <ExternalLink className="h-4 w-4 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      <BookContentGate
        language={language}
        open={bookToOpen !== null}
        onCancel={() => setBookToOpen(null)}
        onConfirm={confirmBookOpen}
      />
    </div>
  );
}
