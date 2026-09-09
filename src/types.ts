export type TemplateId =
  | "template-service"
  | "template-fnb"
  | "template-retail";

export interface WebsiteState {
  templateId: TemplateId;
  theme: {
    primaryColor: string;
    accentColor: string;
    fontFamily: "sans" | "serif" | "display";
  };
  meta: {
    businessName: string;
    category: string;
    tagline: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaWhatsappMessage: string;
  };
  about: {
    story: string;
    highlights: string[];
  };
  services: Array<{
    name: string;
    description: string;
    priceEstimate: string;
  }>;
  testimonials: Array<{
    customerName: string;
    review: string;
  }>;
  contact: {
    whatsappNumber: string;
    address: string;
    instagram: string;
  };
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
}
