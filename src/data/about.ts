export interface Teacher {
  name: { en: string; ru: string };
  role: { en: string; ru: string };
  bio: { en: string; ru: string };
}

export const aboutText = {
  title: {
    en: "Himalayan Devi Temple",
    ru: "Гималайский Храм Дэви",
  },
  subtitle: {
    en: "Sacred Healing Center in Nepal",
    ru: "Священный Исцеляющий Центр в Непале",
  },
  description: {
    en: "Nestled in the foothills of the Himalayas near Pokhara, our center offers transformative 11-day retreat experiences combining sacred ceremonies with integration work, yoga, and deep self-discovery. A dedicated retreat space at a 5-star lakeside resort with a team of 6 facilitators for groups of up to 12 participants.",
    ru: "Расположенный у подножия Гималаев близ Покхары, наш центр предлагает трансформационные 11-дневные ретриты, сочетающие священные церемонии с интеграционной работой, йогой и глубоким самопознанием. Выделенное ретритное пространство в 5-звёздочном курорте на озере с командой из 6 фасилитаторов для групп до 12 участников.",
  },
};

export const teachers: Teacher[] = [
  {
    name: { en: "Serhii", ru: "Сергий" },
    role: {
      en: "Retreat Facilitator, Co-founder",
      ru: "Ведущий ретритов, сооснователь",
    },
    bio: {
      en: "Co-founder of Himalayan Devi Temple and creator of the Himalayan Soul Portal protocol. Serhii developed the protocol through direct experience conducting 100+ ceremonies in Nepal over 4 years. His approach integrates depth psychology, psychoanalysis, and hypnotherapy. He personally leads all ceremonies.",
      ru: "Сооснователь Himalayan Devi Temple и создатель протокола Himalayan Soul Portal. Сергий разработал протокол через непосредственный опыт проведения 100+ церемоний в Непале за 4 года. Его подход объединяет глубинную психологию, психоанализ и гипнотерапию. Лично ведёт все церемонии.",
    },
  },
  {
    name: { en: "Olena", ru: "Олена" },
    role: {
      en: "Integration Facilitator, Co-founder",
      ru: "Фасилитатор интеграции, сооснователь",
    },
    bio: {
      en: "Co-founder of Himalayan Devi Temple. Psychoanalyst, hypnotherapist, and certified psychologist with 28 years of experience and over 5,000 clients internationally. Author of 'The Phenomenon of Suicide.' Olena guides participants through psychological preparation and deep integration work after each session.",
      ru: "Сооснователь Himalayan Devi Temple. Психоаналитик, гипнотерапевт и сертифицированный психолог с 28-летним опытом и более 5 000 клиентов по всему миру. Автор книги «Феномен суицида». Олена проводит участников через психологическую подготовку и глубокую интеграционную работу после каждой сессии.",
    },
  },
  {
    name: { en: "Olesya", ru: "Олеся" },
    role: {
      en: "Apprentice Facilitator",
      ru: "Подмастерье",
    },
    bio: {
      en: "Specialist in body cleansing and detoxification with over 35 completed processes. Trained in hypnotherapy and neurolinguistic programming techniques.",
      ru: "Специалист в области очищения и детоксикации тела. Более 35 пройденных процессов. Владеет техниками гипнотерапии и нейролингвистического программирования.",
    },
  },
];
