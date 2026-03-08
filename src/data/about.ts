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
    en: "Nestled in the foothills of the Himalayas, our center offers transformative retreat experiences combining ancient healing practices with modern hypnotherapy. Here, surrounded by sacred mountains and pure air, you will embark on a journey of deep self-discovery and healing.",
    ru: "Расположенный у подножия Гималаев, наш центр предлагает трансформационные ретриты, сочетающие древние целительные практики с современной гипнотерапией. Здесь, в окружении священных гор и чистого воздуха, вы отправитесь в путешествие глубокого самопознания и исцеления.",
  },
};

export const teachers: Teacher[] = [
  {
    name: { en: "Serhii", ru: "Сергий" },
    role: {
      en: "Hypnotherapist, Past Life Regression & Exorcism Specialist",
      ru: "Гипнотерапевт, специалист по регрессии в прошлые жизни и экзорцизму",
    },
    bio: {
      en: "With over 15 years of experience in hypnotherapy and spiritual healing, Serhii guides participants through deep transformative experiences. His unique approach combines clinical hypnotherapy with ancient wisdom traditions.",
      ru: "С более чем 15-летним опытом в гипнотерапии и духовном исцелении, Сергий проводит участников через глубокие трансформационные переживания. Его уникальный подход сочетает клиническую гипнотерапию с древними традициями мудрости.",
    },
  },
  {
    name: { en: "Olena", ru: "Олена" },
    role: {
      en: "Yoga & Meditation Teacher",
      ru: "Преподаватель йоги и медитации",
    },
    bio: {
      en: "Olena brings years of dedicated yoga and meditation practice to every session. Her gentle yet profound teaching style helps participants connect with their inner stillness.",
      ru: "Олена привносит многолетний опыт практики йоги и медитации в каждый сеанс. Ее мягкий, но глубокий стиль обучения помогает участникам соединиться с внутренней тишиной.",
    },
  },
  {
    name: { en: "Olesya", ru: "Олеся" },
    role: {
      en: "Holistic Healer & Facilitator",
      ru: "Холистический целитель и фасилитатор",
    },
    bio: {
      en: "Olesya specializes in energy work and holistic healing modalities. She creates a nurturing space for participants to explore their healing journey.",
      ru: "Олеся специализируется на энергетической работе и холистических методах исцеления. Она создает заботливое пространство для участников в их целительном путешествии.",
    },
  },
];
