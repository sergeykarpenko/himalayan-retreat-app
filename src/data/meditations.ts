const AUDIO_BASE = "https://bot-api.himalayanholytemple.net/audio";

export interface Track {
  id: string;
  title: { en: string; ru: string };
  description: { en: string; ru: string };
  duration: string;
  category: { en: string; ru: string };
  audioUrl?: string;
}

export const meditations: Track[] = [
  {
    id: "morning-breath",
    title: { en: "Morning Breathwork", ru: "Утреннее дыхание" },
    description: {
      en: "Start your day with energizing pranayama techniques",
      ru: "Начните день с энергичных техник пранаямы",
    },
    duration: "15:00",
    category: { en: "Breathwork", ru: "Дыхание" },
  },
  {
    id: "body-scan",
    title: { en: "Body Scan Relaxation", ru: "Сканирование тела" },
    description: {
      en: "Progressive relaxation from head to toe",
      ru: "Прогрессивная релаксация от головы до пальцев ног",
    },
    duration: "20:00",
    category: { en: "Relaxation", ru: "Релаксация" },
  },
  {
    id: "mountain-visualization",
    title: { en: "Mountain Visualization", ru: "Визуализация горы" },
    description: {
      en: "Connect with the strength and stability of the Himalayas",
      ru: "Соединитесь с силой и стабильностью Гималаев",
    },
    duration: "25:00",
    category: { en: "Visualization", ru: "Визуализация" },
  },
  {
    id: "gratitude",
    title: { en: "Gratitude Meditation", ru: "Медитация благодарности" },
    description: {
      en: "Cultivate deep gratitude and inner peace",
      ru: "Развивайте глубокую благодарность и внутренний покой",
    },
    duration: "15:00",
    category: { en: "Mindfulness", ru: "Осознанность" },
  },
  {
    id: "evening-calm",
    title: { en: "Evening Calm", ru: "Вечернее спокойствие" },
    description: {
      en: "Wind down with a gentle guided meditation for restful sleep",
      ru: "Расслабьтесь с мягкой медитацией для спокойного сна",
    },
    duration: "20:00",
    category: { en: "Sleep", ru: "Сон" },
  },
];

export const attunements: Track[] = [
  {
    id: "calm-confidence",
    title: { en: "Calm & Confidence", ru: "Спокойствие и уверенность" },
    description: {
      en: "Attunement for inner calm and steady confidence",
      ru: "Сонастройка на внутреннее спокойствие и уверенность",
    },
    duration: "9:52",
    category: { en: "Attunement", ru: "Сонастройка" },
    audioUrl: `${AUDIO_BASE}/calm-and-confidence.mp3`,
  },
  {
    id: "deep-immersion",
    title: { en: "Deep Immersion", ru: "Глубокое погружение" },
    description: {
      en: "Extended attunement for deep meditative states",
      ru: "Продвинутая сонастройка для глубоких медитативных состояний",
    },
    duration: "25:12",
    category: { en: "Attunement", ru: "Сонастройка" },
    audioUrl: `${AUDIO_BASE}/deep-immersion.mp3`,
  },
  {
    id: "full-relaxation",
    title: { en: "Full Relaxation", ru: "Полное расслабление" },
    description: {
      en: "Complete body and mind relaxation attunement",
      ru: "Сонастройка на полное расслабление тела и ума",
    },
    duration: "12:04",
    category: { en: "Attunement", ru: "Сонастройка" },
    audioUrl: `${AUDIO_BASE}/full-relaxation.mp3`,
  },
  {
    id: "abundance",
    title: { en: "Abundance Flow", ru: "Поток изобилия" },
    description: {
      en: "Attunement for prosperity and abundance",
      ru: "Денежная сонастройка на процветание и изобилие",
    },
    duration: "14:46",
    category: { en: "Attunement", ru: "Сонастройка" },
    audioUrl: `${AUDIO_BASE}/abundance-flow.mp3`,
  },
  {
    id: "soul",
    title: { en: "Soul Attunement", ru: "Сонастройка души" },
    description: {
      en: "Deep connection with your inner self",
      ru: "Глубокое соединение с вашим внутренним я",
    },
    duration: "14:46",
    category: { en: "Attunement", ru: "Сонастройка" },
    audioUrl: `${AUDIO_BASE}/soul-attunement.mp3`,
  },
  {
    id: "negativity-release",
    title: { en: "Negativity Release", ru: "Трансформация негатива" },
    description: {
      en: "Release negative energy and transform it into light",
      ru: "Отпустите негативную энергию и трансформируйте её в свет",
    },
    duration: "14:46",
    category: { en: "Attunement", ru: "Сонастройка" },
    audioUrl: `${AUDIO_BASE}/negativity-release.mp3`,
  },
];
