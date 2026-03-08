export interface ScheduleItem {
  time: string;
  title: { en: string; ru: string };
  description?: { en: string; ru: string };
  icon: string;
}

export interface DaySchedule {
  tab: { en: string; ru: string };
  title: { en: string; ru: string };
  items: ScheduleItem[];
}

export const schedule: DaySchedule[] = [
  {
    tab: { en: "Day 1", ru: "День 1" },
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
        title: { en: "Opening Integration", ru: "Открывающая интеграция" },
        description: {
          en: "Group session to set intentions for the retreat",
          ru: "Групповая сессия для установки намерений на ретрит",
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
    tab: { en: "Days 2–5", ru: "Дни 2–5" },
    title: { en: "Ceremonies — First Round", ru: "Церемонии — первый раунд" },
    items: [
      {
        time: "07:30",
        title: { en: "Morning Yoga", ru: "Утренняя йога" },
        icon: "sun",
      },
      {
        time: "09:00",
        title: { en: "Light Breakfast", ru: "Лёгкий завтрак" },
        icon: "utensils",
      },
      {
        time: "10:00",
        title: { en: "Integration Circle", ru: "Интеграционный круг" },
        description: {
          en: "Group sharing and education session",
          ru: "Групповое обсуждение и образовательная сессия",
        },
        icon: "message-circle",
      },
      {
        time: "12:00",
        title: { en: "Sacred Ceremony", ru: "Священная церемония" },
        description: {
          en: "Guided transformative experience with facilitators",
          ru: "Трансформационный опыт под руководством ведущих",
        },
        icon: "sparkles",
      },
      {
        time: "21:00",
        title: { en: "Dinner", ru: "Ужин" },
        icon: "utensils",
      },
      {
        time: "22:00",
        title: { en: "Rest", ru: "Отдых" },
        icon: "moon",
      },
    ],
  },
  {
    tab: { en: "Day 6", ru: "День 6" },
    title: { en: "Rest & Recovery", ru: "Отдых и восстановление" },
    items: [
      {
        time: "09:00",
        title: { en: "Light Breakfast", ru: "Лёгкий завтрак" },
        icon: "utensils",
      },
      {
        time: "10:00",
        title: { en: "Integration Circle", ru: "Интеграционный круг" },
        description: {
          en: "Reflect on the first round of ceremonies",
          ru: "Осмысление первого раунда церемоний",
        },
        icon: "message-circle",
      },
      {
        time: "14:00",
        title: { en: "Lunch", ru: "Обед" },
        icon: "utensils",
      },
      {
        time: "15:00",
        title: {
          en: "Free Time / Nature Walk",
          ru: "Свободное время / Прогулка",
        },
        description: {
          en: "Personal reflection, nature walks, journaling",
          ru: "Личное осмысление, прогулки, записи в дневнике",
        },
        icon: "mountain",
      },
      {
        time: "19:00",
        title: { en: "Dinner", ru: "Ужин" },
        icon: "utensils",
      },
      {
        time: "22:00",
        title: { en: "Rest", ru: "Отдых" },
        icon: "moon",
      },
    ],
  },
  {
    tab: { en: "Days 7–10", ru: "Дни 7–10" },
    title: { en: "Ceremonies — Second Round", ru: "Церемонии — второй раунд" },
    items: [
      {
        time: "07:30",
        title: { en: "Morning Yoga", ru: "Утренняя йога" },
        icon: "sun",
      },
      {
        time: "09:00",
        title: { en: "Light Breakfast", ru: "Лёгкий завтрак" },
        icon: "utensils",
      },
      {
        time: "10:00",
        title: { en: "Integration Circle", ru: "Интеграционный круг" },
        description: {
          en: "Group sharing and education session",
          ru: "Групповое обсуждение и образовательная сессия",
        },
        icon: "message-circle",
      },
      {
        time: "12:00",
        title: { en: "Sacred Ceremony", ru: "Священная церемония" },
        description: {
          en: "Guided transformative experience with facilitators",
          ru: "Трансформационный опыт под руководством ведущих",
        },
        icon: "sparkles",
      },
      {
        time: "21:00",
        title: { en: "Dinner", ru: "Ужин" },
        icon: "utensils",
      },
      {
        time: "22:00",
        title: { en: "Rest", ru: "Отдых" },
        icon: "moon",
      },
    ],
  },
  {
    tab: { en: "Day 11", ru: "День 11" },
    title: { en: "Closing & Departure", ru: "Закрытие и отъезд" },
    items: [
      {
        time: "09:00",
        title: { en: "Light Breakfast", ru: "Лёгкий завтрак" },
        icon: "utensils",
      },
      {
        time: "10:00",
        title: { en: "Closing Session", ru: "Закрывающая сессия" },
        description: {
          en: "Gratitude circle, sharing, and farewell",
          ru: "Круг благодарности, обмен впечатлениями и прощание",
        },
        icon: "heart",
      },
      {
        time: "12:00",
        title: { en: "Checkout", ru: "Выселение" },
        icon: "door-open",
      },
    ],
  },
];
