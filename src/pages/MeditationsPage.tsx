import { Headphones, Clock, Lock, Send, Play, Pause, Download, Check, Loader2, BookOpen } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { meditations, attunements, books, type Track, type Book } from "@/data/meditations";
import { TelegramLoginButton } from "@/components/shared/TelegramLoginButton";

const AUDIO_CACHE = "audio-cache";

async function isTrackCached(url: string): Promise<boolean> {
  try {
    const cache = await caches.open(AUDIO_CACHE);
    const resp = await cache.match(url);
    return !!resp;
  } catch {
    return false;
  }
}

async function cacheTrack(url: string, onProgress?: (pct: number) => void): Promise<void> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Download failed");

  const total = Number(resp.headers.get("content-length")) || 0;
  const reader = resp.body?.getReader();
  if (!reader) throw new Error("No stream");

  const chunks: BlobPart[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (total > 0 && onProgress) onProgress(Math.round((loaded / total) * 100));
  }

  const blob = new Blob(chunks, { type: "audio/mpeg" });
  const cache = await caches.open(AUDIO_CACHE);
  await cache.put(url, new Response(blob, {
    headers: { "Content-Type": "audio/mpeg", "Content-Length": String(blob.size) },
  }));
}

function AudioTrack({ track, language, activeTrackId, onPlay }: { track: Track; language: "en" | "ru"; activeTrackId: string | null; onPlay: (id: string) => void }) {
  const [playing, setPlaying] = useState(false);
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (track.audioUrl) {
      isTrackCached(track.audioUrl).then(setCached);
    }
  }, [track.audioUrl]);

  // Pause when another track becomes active
  useEffect(() => {
    if (activeTrackId !== track.id && playing) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [activeTrackId, track.id, playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handleDownload = useCallback(async () => {
    if (!track.audioUrl || cached || downloading) return;
    setDownloading(true);
    setProgress(0);
    try {
      await cacheTrack(track.audioUrl, setProgress);
      setCached(true);
    } catch {
      // download failed silently
    } finally {
      setDownloading(false);
    }
  }, [track.audioUrl, cached, downloading]);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(track.audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      onPlay(track.id);
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
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
        <p className="text-xs text-muted-foreground truncate">
          {track.category[language]}
        </p>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span className="text-xs font-mono">{track.duration}</span>
        {cached ? (
          <Check className="h-4 w-4 ml-1 text-green-500" />
        ) : downloading ? (
          <div className="relative ml-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress > 0 && (
              <span className="absolute -top-3 -right-1 text-[9px] font-mono">{progress}%</span>
            )}
          </div>
        ) : (
          <button onClick={handleDownload} className="ml-1 p-0.5 rounded hover:bg-primary/10 transition-colors" title="Download for offline">
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function DownloadAllButton({ tracks, language }: { tracks: Track[]; language: "en" | "ru" }) {
  const [allCached, setAllCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(0);

  useEffect(() => {
    Promise.all(tracks.map((t) => t.audioUrl ? isTrackCached(t.audioUrl) : Promise.resolve(true)))
      .then((results) => setAllCached(results.every(Boolean)));
  }, [tracks]);

  const handleDownloadAll = async () => {
    if (allCached || downloading) return;
    setDownloading(true);
    setDone(0);
    for (const track of tracks) {
      if (!track.audioUrl) continue;
      const isCached = await isTrackCached(track.audioUrl);
      if (!isCached) {
        try {
          await cacheTrack(track.audioUrl);
        } catch {
          // skip failed
        }
      }
      setDone((d) => d + 1);
    }
    setAllCached(true);
    setDownloading(false);
  };

  if (allCached) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-500">
        <Check className="h-3.5 w-3.5" />
        {language === "ru" ? "Офлайн" : "Offline"}
      </span>
    );
  }

  return (
    <button
      onClick={handleDownloadAll}
      disabled={downloading}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
    >
      {downloading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {done}/{tracks.length}
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5" />
          {language === "ru" ? "Скачать все" : "Download all"}
        </>
      )}
    </button>
  );
}

const FREE_TRACKS = 2;

function LockedTrack({ track, language }: { track: Track; language: "en" | "ru" }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 opacity-50">
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
          <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5">
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
              <TelegramLoginButton size="large" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const freeTracks = attunements.slice(0, FREE_TRACKS);
  const paidTracks = attunements.slice(FREE_TRACKS);
  const availableTracks = isPaid ? attunements : freeTracks;

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
        {freeTracks.map((track) => (
          <AudioTrack key={track.id} track={track} language={language} activeTrackId={activeTrackId} onPlay={setActiveTrackId} />
        ))}
        {isPaid
          ? paidTracks.map((track) => (
              <AudioTrack key={track.id} track={track} language={language} activeTrackId={activeTrackId} onPlay={setActiveTrackId} />
            ))
          : paidTracks.map((track) => (
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
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 opacity-50"
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
      </div>

      <div className="px-4 pb-8 space-y-3">
        {books.map((book) => {
          const canDownload = user && book.available;
          const isComingSoon = !book.available;

          const Wrapper = canDownload ? "a" : "div";
          const wrapperProps = canDownload
            ? { href: book.downloadUrl!, download: true, target: "_blank", rel: "noopener noreferrer" }
            : {};

          return (
            <Wrapper
              key={book.id}
              {...(wrapperProps as any)}
              className={`flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors ${isComingSoon ? "opacity-50" : ""} ${canDownload ? "active:bg-primary/5" : ""}`}
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
                  <Download className="h-4 w-4 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
