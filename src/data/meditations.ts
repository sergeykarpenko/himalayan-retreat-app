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
