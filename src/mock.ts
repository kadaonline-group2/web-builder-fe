import type { WebsiteState } from "./types";

export const mockWebsite: WebsiteState = {
  templateId: "template-fnb",
  theme: {
    primaryColor: "#7B3F00",
    accentColor: "#F4A261",
    fontFamily: "display",
  },
  meta: {
    businessName: "Warung Kopi Sejahtera",
    category: "F&B",
    tagline: "Kopi Tubruk Autentik Surabaya",
  },
  hero: {
    title: "Ngopi Santai, Tetap Produktif",
    subtitle: "Kopi tubruk dan roti bakar favorit anak muda Surabaya.",
    ctaText: "Pesan via WhatsApp",
    ctaWhatsappMessage: "Halo, saya mau pesan kopi",
  },
  about: {
    story:
      "Warung Kopi Sejahtera hadir untuk menemani harimu dengan racikan kopi tubruk khas dan suasana nyaman buat nugas.",
    highlights: [
      "Kopi asli lokal",
      "Tempat nyaman buat nugas",
      "Harga bersahabat",
    ],
  },
  services: [
    {
      name: "Kopi Tubruk",
      description: "Kopi hitam khas dengan ampas alami.",
      priceEstimate: "Rp10.000",
    },
    {
      name: "Roti Bakar Coklat Keju",
      description: "Roti bakar dengan isian melimpah.",
      priceEstimate: "Rp15.000",
    },
    {
      name: "Es Kopi Susu",
      description: "Kopi susu dingin dengan rasa manis pas.",
      priceEstimate: "Rp13.000",
    },
  ],
  testimonials: [
    {
      customerName: "Rina",
      review: "Kopinya enak banget, tempatnya juga nyaman buat kerja.",
    },
    {
      customerName: "Budi",
      review: "Harga terjangkau, cocok buat nongkrong santai.",
    },
  ],
  contact: {
    whatsappNumber: "628123456789",
    address: "Jl. Merdeka No. 10, Surabaya",
    instagram: "@warungkopisejahtera",
  },
};

export async function mockGenerateWebsite(
  prompt: string,
  current: WebsiteState,
): Promise<WebsiteState> {
  await new Promise((resolve) => window.setTimeout(resolve, 650));
  const next = structuredClone(current);
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("navy")) {
    next.theme = {
      ...next.theme,
      primaryColor: "#12304A",
      accentColor: "#D4A373",
    };
  } else if (lowerPrompt.includes("hijau") || lowerPrompt.includes("green")) {
    next.theme = {
      ...next.theme,
      primaryColor: "#315C4A",
      accentColor: "#E8C07D",
    };
  } else {
    next.hero = {
      ...next.hero,
      subtitle: `Diperbarui dari brief kamu: ${prompt}`,
    };
  }

  return next;
}

export async function mockDownload(): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 450));
}
