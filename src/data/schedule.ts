export interface ScheduleItem {
  time: string;
  title: { en: string; ru: string };
  description?: { en: string; ru: string };
  icon: string;
}

export interface DaySchedule {
  day: number;
  title: { en: string; ru: string };
  items: ScheduleItem[];
}

export const schedule: DaySchedule[] = [
  {
    day: 1,
    title: { en: "Arrival & Opening", ru: "Прибытие и открытие" },
    items: [
      {
        time: "14:00",
        title: { en: "Check-in & Room Setup", ru: "Заселение и размещение" },
        description: {
          en: "Settle into your room, explore the center",
          ru: "Обустройтесь в комнате, осмотрите центр",
        },
        icon: "door-open",
      },
      {
        time: "16:00",
        title: { en: "Welcome Circle", ru: "Приветственный круг" },
        description: {
          en: "Introduction, guidelines, and getting to know each other",
          ru: "Знакомство, правила и представление участников",
        },
        icon: "users",
      },
      {
        time: "17:30",
        title: { en: "Opening Meditation", ru: "Открывающая медитация" },
        description: {
          en: "Guided meditation to set intentions",
          ru: "Медитация для установки намерений",
        },
        icon: "sparkles",
      },
      {
        time: "19:00",
        title: { en: "Dinner", ru: "Ужин" },
        icon: "utensils",
      },
    ],
  },
  {
    day: 2,
    title: { en: "Deep Practice", ru: "Глубокая практика" },
    items: [
      {
        time: "06:00",
        title: { en: "Morning Yoga", ru: "Утренняя йога" },
        icon: "sun",
      },
      {
        time: "07:30",
        title: { en: "Breakfast", ru: "Завтрак" },
        icon: "utensils",
      },
      {
        time: "09:00",
        title: {
          en: "Past Life Regression Session",
          ru: "Сеанс регрессии в прошлые жизни",
        },
        description: {
          en: "Group hypnotherapy session with Serhii",
          ru: "Групповой сеанс гипнотерапии с Сергием",
        },
        icon: "brain",
      },
      {
        time: "12:00",
        title: { en: "Lunch", ru: "Обед" },
        icon: "utensils",
      },
      {
        time: "14:00",
        title: { en: "Integration & Sharing", ru: "Интеграция и обсуждение" },
        description: {
          en: "Process and share your experience in a safe space",
          ru: "Осмысление и обсуждение опыта в безопасном пространстве",
        },
        icon: "message-circle",
      },
      {
        time: "16:00",
        title: { en: "Free Time / Nature Walk", ru: "Свободное время / Прогулка" },
        icon: "mountain",
      },
      {
        time: "19:00",
        title: { en: "Dinner", ru: "Ужин" },
        icon: "utensils",
      },
      {
        time: "20:30",
        title: { en: "Evening Meditation", ru: "Вечерняя медитация" },
        icon: "moon",
      },
    ],
  },
  {
    day: 3,
    title: { en: "Healing & Release", ru: "Исцеление и отпускание" },
    items: [
      {
        time: "06:00",
        title: { en: "Morning Meditation", ru: "Утренняя медитация" },
        icon: "sun",
      },
      {
        time: "07:30",
        title: { en: "Breakfast", ru: "Завтрак" },
        icon: "utensils",
      },
      {
        time: "09:00",
        title: { en: "Exorcism & Energy Clearing", ru: "Экзорцизм и очищение энергии" },
        description: {
          en: "Advanced healing session for deep release",
          ru: "Продвинутый сеанс исцеления для глубокого отпускания",
        },
        icon: "flame",
      },
      {
        time: "12:00",
        title: { en: "Lunch", ru: "Обед" },
        icon: "utensils",
      },
      {
        time: "14:00",
        title: { en: "Individual Consultations", ru: "Индивидуальные консультации" },
        description: {
          en: "One-on-one sessions available by sign-up",
          ru: "Индивидуальные сессии по предварительной записи",
        },
        icon: "user",
      },
      {
        time: "17:00",
        title: { en: "Closing Ceremony", ru: "Закрывающая церемония" },
        description: {
          en: "Gratitude circle, sharing, and farewell",
          ru: "Круг благодарности, обмен впечатлениями и прощание",
        },
        icon: "heart",
      },
      {
        time: "19:00",
        title: { en: "Farewell Dinner", ru: "Прощальный ужин" },
        icon: "utensils",
      },
    ],
  },
];
