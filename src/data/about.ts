export interface Teacher {
  name: { en: string; ru: string };
  role: { en: string; ru: string };
  bio: { en: string; ru: string };
  photo?: { src: string; width: number; height: number };
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
    en: "Nestled in a mountain valley at the foot of the Annapurna range in Nepal, our center offers transformative 9-day retreat experiences combining sacred ceremonies with integration work, yoga, and deep self-discovery. A dedicated retreat space with its own block of rooms and ceremonial hall, supported by a 15-person team, for intimate groups of up to 16 participants.",
    ru: "Расположенный в горной долине у подножия Аннапурны в Непале, наш центр предлагает трансформационные 9-дневные ретриты, сочетающие священные церемонии с интеграционной работой, йогой и глубоким самопознанием. Выделенное ретритное пространство со своим блоком комнат и церемониальным залом, команда сопровождения из 15 человек, камерные группы до 16 участников.",
  },
};

export const teachers: Teacher[] = [
  {
    name: { en: "Serhii", ru: "Сергий" },
    photo: { src: "/team/serhii-karpenko.webp", width: 800, height: 1200 },
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
    photo: { src: "/team/olena-ruta.webp", width: 800, height: 1200 },
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
    photo: { src: "/team/olesya-dembitskaya.webp", width: 449, height: 449 },
    role: {
      en: "Apprentice Facilitator",
      ru: "Подмастерье",
    },
    bio: {
      en: "Specialist in body cleansing and detoxification with over 35 completed processes. Trained in hypnotherapy and neurolinguistic programming techniques.",
      ru: "Специалист в области очищения и детоксикации тела. Более 35 пройденных процессов. Владеет техниками гипнотерапии и нейролингвистического программирования.",
    },
  },
  {
    name: {
      en: "Yulia Gorodnichaya",
      ru: "Юлия Городничая",
    },
    photo: {
      src: "/team/nepal-school-apprentice.webp",
      width: 853,
      height: 1280,
    },
    role: {
      en: "Hypnotherapist-Regressionist, Facilitator",
      ru: "Гипнотерапевт-регрессолог, фасилитатор",
    },
    bio: {
      en: "A student of the Nepal School of Exorcism. She practices hypnotherapy and regression work and supports retreat participants as a facilitator.",
      ru: "Ученица Непальской школы экзорцизма. Практикует гипнотерапию и регрессионную работу, сопровождает участников ретритов в качестве фасилитатора.",
    },
  },
];
