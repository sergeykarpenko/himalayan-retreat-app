export interface GuideSection {
  id: string;
  title: { en: string; ru: string };
  icon: string;
  items: { en: string; ru: string }[];
}

export const guideSections: GuideSection[] = [
  {
    id: "packing",
    title: { en: "What to Bring", ru: "Что взять с собой" },
    icon: "backpack",
    items: [
      {
        en: "Comfortable loose clothing for meditation and yoga",
        ru: "Удобная свободная одежда для медитации и йоги",
      },
      {
        en: "Warm layers (evenings can be cool in the mountains)",
        ru: "Теплые вещи (вечера в горах могут быть прохладными)",
      },
      {
        en: "Comfortable walking shoes for nature walks",
        ru: "Удобная обувь для прогулок на природе",
      },
      {
        en: "Personal journal and pen for reflections",
        ru: "Личный дневник и ручка для записей",
      },
      {
        en: "Water bottle (refill stations available)",
        ru: "Бутылка для воды (есть станции для наполнения)",
      },
      {
        en: "Sunscreen and hat for daytime",
        ru: "Солнцезащитный крем и шляпа для дневного времени",
      },
      {
        en: "Any personal medications",
        ru: "Личные лекарства при необходимости",
      },
      {
        en: "Voice recorder for integration sessions",
        ru: "Диктофон для интеграционных сессий",
      },
    ],
  },
  {
    id: "diet",
    title: { en: "Diet & Nutrition", ru: "Питание и диета" },
    icon: "apple",
    items: [
      {
        en: "Vegetarian meals are provided throughout the retreat",
        ru: "На протяжении ретрита предоставляется вегетарианское питание",
      },
      {
        en: "Please inform us of any food allergies in advance",
        ru: "Пожалуйста, сообщите о пищевых аллергиях заранее",
      },
      {
        en: "Herbal teas and filtered water available 24/7",
        ru: "Травяные чаи и фильтрованная вода доступны круглосуточно",
      },
      {
        en: "Avoid alcohol and caffeine 3 days before the retreat",
        ru: "Избегайте алкоголя и кофеина за 3 дня до ретрита",
      },
      {
        en: "Fasting protocols available — see our fasting guide",
        ru: "Доступны протоколы голодания — см. наш гайд по голоданию",
      },
    ],
  },
  {
    id: "health",
    title: { en: "Health & Safety", ru: "Здоровье и безопасность" },
    icon: "heart-pulse",
    items: [
      {
        en: "Medical screening is required before participation",
        ru: "Перед участием необходимо пройти медицинский скрининг",
      },
      {
        en: "Inform facilitators of any physical or mental health conditions",
        ru: "Сообщите ведущим о любых физических или психических заболеваниях",
      },
      {
        en: "First aid kit is available at the center",
        ru: "Аптечка первой помощи доступна в центре",
      },
      {
        en: "Nearest hospital is 5 minutes away",
        ru: "Ближайшая больница в 5 минутах езды",
      },
    ],
  },
  {
    id: "getting-there",
    title: { en: "Getting There", ru: "Как добраться" },
    icon: "map-pin",
    items: [
      {
        en: "Fly to Tribhuvan International Airport (KTM), Kathmandu",
        ru: "Прилетите в международный аэропорт Трибхуван (KTM), Катманду",
      },
      {
        en: "We arrange pickup from Kathmandu (included in the package)",
        ru: "Мы организуем трансфер из Катманду (включен в пакет)",
      },
      {
        en: "Drive to the center takes approximately 1-2 hours",
        ru: "Дорога до центра занимает примерно 1-2 часа",
      },
      {
        en: "Visa on arrival available for most nationalities",
        ru: "Виза по прибытии доступна для большинства национальностей",
      },
    ],
  },
  {
    id: "rules",
    title: { en: "Guidelines", ru: "Правила" },
    icon: "scroll",
    items: [
      {
        en: "Maintain silence during designated quiet hours (22:00-06:00)",
        ru: "Соблюдайте тишину в часы молчания (22:00-06:00)",
      },
      {
        en: "Phones on silent mode; limited use encouraged",
        ru: "Телефоны на беззвучном режиме; рекомендуется ограниченное использование",
      },
      {
        en: "Phones are not allowed during Sacred Ceremonies",
        ru: "Телефоны запрещены во время Священных церемоний",
      },
      {
        en: "Respect the privacy and experience of all participants",
        ru: "Уважайте приватность и опыт всех участников",
      },
      {
        en: "No recording of sessions without permission",
        ru: "Запись сеансов без разрешения запрещена",
      },
      {
        en: "Be punctual for all scheduled activities",
        ru: "Приходите вовремя на все запланированные мероприятия",
      },
    ],
  },
  {
    id: "after",
    title: { en: "After the Retreat", ru: "После ретрита" },
    icon: "leaf",
    items: [
      {
        en: "90-day post-retreat integration program with 4 online sessions",
        ru: "90-дневная программа интеграции после ретрита с 4 онлайн-сессиями",
      },
      {
        en: "Personal consultations with retreat facilitators available upon request",
        ru: "Персональные консультации с проводниками ретрита доступны по запросу",
      },
      {
        en: "Integration support available via our Telegram bot",
        ru: "Поддержка интеграции доступна через нашего Telegram-бота",
      },
      {
        en: "Allow yourself 1-2 days of quiet transition back to daily life",
        ru: "Дайте себе 1-2 дня тихого перехода к повседневной жизни",
      },
      {
        en: "Continue daily meditation practice (even 10 minutes helps)",
        ru: "Продолжайте ежедневную практику медитации (даже 10 минут помогут)",
      },
      {
        en: "Stay connected with fellow participants",
        ru: "Поддерживайте связь с другими участниками",
      },
    ],
  },
];
