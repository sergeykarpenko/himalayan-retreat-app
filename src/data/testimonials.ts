export interface Testimonial {
  id: string;
  videoId: string;
  name: { en: string; ru: string };
  topic: { en: string; ru: string };
}

export const testimonials: Testimonial[] = [
  {
    id: "maksim",
    videoId: "sOfHoGGN-jI",
    name: { en: "Maksim", ru: "Максим" },
    topic: { en: "Quit Smoking in 11 Days", ru: "Бросил курить за 11 дней" },
  },
  {
    id: "sergey",
    videoId: "aPSiVZGdPwM",
    name: { en: "Sergey", ru: "Сергей" },
    topic: {
      en: "Hypnotherapist-Healer",
      ru: "Гипнотерапевт-целитель, исцеление и обучение",
    },
  },
  {
    id: "yana",
    videoId: "xsUV7LFiA8M",
    name: { en: "Yana", ru: "Яна" },
    topic: {
      en: "Inner Call",
      ru: "Психическое расстройство, зов внутри",
    },
  },
  {
    id: "maria",
    videoId: "4OHNlb94U2Y",
    name: { en: "Maria", ru: "Мария" },
    topic: { en: "Story", ru: "История" },
  },
];
