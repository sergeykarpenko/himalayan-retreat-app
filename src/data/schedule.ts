export interface DaySchedule {
  date: { en: string; ru: string };
  title: { en: string; ru: string };
  description: { en: string; ru: string };
  icon: string;
}

export const schedule: DaySchedule[] = [
  {
    date: { en: "Sep 23", ru: "23 сентября" },
    title: { en: "Arrival in Kathmandu", ru: "Прилёт в Катманду" },
    description: {
      en: "Individual transfer and hotel check-in in Kathmandu, time to rest after the flight. In the evening, a walk through Thamel: incense, artisan shops, dinner in a traditional Nepali home.",
      ru: "Индивидуальный трансфер и размещение в отеле Катманду, отдых после перелёта. Вечером — прогулка по кварталу Тамель: благовония, лавки мастеров, ужин в непальском доме.",
    },
    icon: "door-open",
  },
  {
    date: { en: "Sep 24", ru: "24 сентября" },
    title: {
      en: "Holy Sites of Kathmandu",
      ru: "Святые места Катманду",
    },
    description: {
      en: "A day in Kathmandu visiting the great UNESCO-listed stupa and Pashupatinath temple. In the evening, rest and preparation for the morning flight to the valley.",
      ru: "День в Катманду: великая ступа из списка ЮНЕСКО и храм Пашупатинатх. Вечером — отдых и подготовка к утреннему перелёту в долину.",
    },
    icon: "map-pin",
  },
  {
    date: { en: "Sep 25", ru: "25 сентября" },
    title: {
      en: "Morning Flight & Settling In",
      ru: "Утренний перелёт и день настройки",
    },
    description: {
      en: "A morning flight to the mountain valley below Annapurna and check-in at the complex. A quiet day to settle in, set intentions, and talk with the facilitators ahead of the ceremony cycle. Early rest — tomorrow is the full moon.",
      ru: "Утром — перелёт в горную долину под Аннапурной и заезд в комплекс. Спокойный день для размещения, настройки намерения и бесед с ведущими перед циклом церемоний. Ранний отдых — завтра полнолуние.",
    },
    icon: "leaf",
  },
  {
    date: { en: "Sep 26", ru: "26 сентября" },
    title: { en: "First Ceremony — Full Moon", ru: "Первая церемония. Полнолуние" },
    description: {
      en: "Morning practices, a light breakfast. During the day, the first ceremony with the teacher plants takes place in the complex's ceremonial hall, in complete silence. That night the full Harvest Moon rises over Annapurna, and the same day marks the start of Pitru Paksha — two weeks devoted to ancestors and lineage.",
      ru: "Утренние практики, лёгкий завтрак. Днём — первая церемония с растениями-учителями в зале комплекса, в полной тишине. В эту ночь над Аннапурной восходит полная Урожайная луна, и в этот же день открывается Питру Пакша — две недели, посвящённые предкам и роду.",
    },
    icon: "sparkles",
  },
  {
    date: { en: "Sep 27", ru: "27 сентября" },
    title: { en: "Second Ceremony", ru: "Вторая церемония" },
    description: {
      en: "Morning practices, breakfast, integration circle. The second ceremony continues and deepens the journey during the day. In the evening, a performance by a Nepali folk ensemble in traditional dress.",
      ru: "Утренние практики, завтрак, интеграционный круг. Днём — вторая церемония, продолжение и углубление пути. Вечером — выступление непальского коллектива в национальных костюмах.",
    },
    icon: "sparkles",
  },
  {
    date: { en: "Sep 28", ru: "28 сентября" },
    title: { en: "Third Ceremony", ru: "Третья церемония" },
    description: {
      en: "Morning practices, breakfast, integration circle, yoga. The third ceremony — the heart of the cycle — takes place during the day. In the evening, ancient Tibetan throat singing in the hall.",
      ru: "Утренние практики, завтрак, интеграционный круг, йога. Днём — третья церемония, сердцевина цикла. Вечером — древнее тибетское горловое пение в зале.",
    },
    icon: "sparkles",
  },
  {
    date: { en: "Sep 29", ru: "29 сентября" },
    title: { en: "Fourth Ceremony", ru: "Четвёртая церемония" },
    description: {
      en: "Morning practices, breakfast, integration circle. The fourth and final ceremony of the cycle takes place during the day. In the evening, a gratitude circle and a fire show against the mountains.",
      ru: "Утренние практики, завтрак, интеграционный круг. Днём — четвёртая, завершающая церемония цикла. Вечером — круг благодарности и фаер-шоу на фоне гор.",
    },
    icon: "sparkles",
  },
  {
    date: { en: "Sep 30", ru: "30 сентября" },
    title: { en: "Paragliding & Workshops", ru: "Параглайдинг и мастер-классы" },
    description: {
      en: "Morning tandem paragliding flight with an instructor over the mountain lake and Annapurna foothills. After lunch, singing-bowl and calligraphy workshops, pool, massage. In the evening, a closing concert and stories from a local storyteller.",
      ru: "Утром — полёт на параглайдинге в тандеме с инструктором над горным озером и предгорьями Аннапурны. После обеда — мастер-классы поющих чаш и каллиграфии, бассейн, массаж. Вечером — концерт завершения цикла и истории сказителя долины.",
    },
    icon: "mountain",
  },
  {
    date: { en: "Oct 1", ru: "1 октября" },
    title: { en: "Departure", ru: "Выезд" },
    description: {
      en: "Breakfast, personalized farewell gifts, transfer to the local airport and a short flight back to Kathmandu. Guests with later flights can use a rest room at the hotel for one final walk through Thamel.",
      ru: "Завтрак, вручение именных подарочных наборов, переезд в местный аэропорт и внутренний перелёт в Катманду. Гостям с поздними вылетами доступна комната отдыха в отеле и финальная прогулка по Тамелю.",
    },
    icon: "door-open",
  },
];
