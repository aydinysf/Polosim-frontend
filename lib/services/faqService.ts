import { api } from "../api-client";

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category?: string;
  order: number;
  translations?: {
    [lang: string]: {
      question: string;
      answer: string;
    };
  };
}

export interface FaqCategory {
  name: string;
  slug: string;
  faqs: Faq[];
}

export const faqService = {
  async getAll(lang: string = "en"): Promise<Faq[]> {
    const response = await api.get<Faq[]>(`/faqs?lang=${lang}`);
    return response.data;
  },

  async getByCategory(category: string, lang: string = "en"): Promise<Faq[]> {
    const response = await api.get<Faq[]>(`/faqs?category=${category}&lang=${lang}`);
    return response.data;
  },

  async getCategories(): Promise<FaqCategory[]> {
    const response = await api.get<FaqCategory[]>("/faqs/categories");
    return response.data;
  },

  // Helper to get translated content
  getTranslatedFaq(faq: Faq, lang: string): { question: string; answer: string } {
    if (faq.translations && faq.translations[lang]) {
      return faq.translations[lang];
    }
    return { question: faq.question, answer: faq.answer };
  },
};
