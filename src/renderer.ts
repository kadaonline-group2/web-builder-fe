import type { WebsiteState } from "./types";

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] ?? character,
  );

const safeColor = (value: string, fallback: string): string =>
  /^#[0-9A-F]{6}$/i.test(value) ? value : fallback;

export const templatePalettes = {
  "template-services": {
    className: "template-services",
    radius: "8px",
    heroScale: "1.06",
    label: "Jasa",
    primaryColor: "#176B66",
    accentColor: "#E0A458",
    paperColor: "#F5F4EF",
    inkColor: "#17241F",
    mutedColor: "#63716B",
  },
  "template-fnb": {
    className: "template-fnb",
    radius: "22px",
    heroScale: "1.04",
    label: "F&B",
    primaryColor: "#A64B2A",
    accentColor: "#F2B263",
    paperColor: "#FFF8EF",
    inkColor: "#2A211B",
    mutedColor: "#79695B",
  },
  "template-retail": {
    className: "template-retail",
    radius: "2px",
    heroScale: "1.12",
    label: "Retail",
    primaryColor: "#263238",
    accentColor: "#C6D64F",
    paperColor: "#F4F4F1",
    inkColor: "#171A18",
    mutedColor: "#626A64",
  },
} as const;

const templates = templatePalettes;

export function renderWebsite(state: WebsiteState): string {
  const template =
    templates[state.templateId] ?? templates["template-services"];
  const primary = safeColor(state.theme.primaryColor, template.primaryColor);
  const accent = safeColor(state.theme.accentColor ?? "", template.accentColor);
  const font =
    state.theme.fontFamily === "serif"
      ? "Georgia, serif"
      : state.theme.fontFamily === "display"
        ? "Trebuchet MS, sans-serif"
        : "Verdana, sans-serif";
  const whatsapp = `https://wa.me/${encodeURIComponent(state.contact.whatsappNumber)}?text=${encodeURIComponent(state.hero.ctaWhatsappMessage)}`;
  const instagram = (state.contact.instagram ?? "").replace(/^@/, "");
  const highlights = state.about.highlights ?? [];
  const testimonials = state.testimonials ?? [];

  return `<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
  :root { --primary: ${primary}; --accent: ${accent}; --ink: ${template.inkColor}; --paper: ${template.paperColor}; --muted: ${template.mutedColor}; --radius: ${template.radius}; }
  * { box-sizing: border-box; } body { margin: 0; color: var(--ink); background: var(--paper); font-family: ${font}; line-height: 1.6; } a { color: inherit; } .page { max-width: 1040px; margin: auto; overflow: hidden; } .eyebrow { color: var(--primary); text-transform: uppercase; letter-spacing: .16em; font-size: 11px; font-weight: 700; } .hero { min-height: 440px; padding: 72px clamp(24px, 7vw, 88px); color: white; background: var(--primary); display: grid; align-items: end; position: relative; } .hero:after { content: ''; position: absolute; width: 280px; height: 280px; border-radius: 50%; background: var(--accent); opacity: .25; right: -90px; top: -90px; } .hero-content { position: relative; z-index: 1; max-width: 650px; } h1 { font-size: clamp(42px, 7vw, 78px); line-height: 1.02; letter-spacing: -0.03em; margin: 14px 0 20px; transform: scaleX(${template.heroScale}); transform-origin: left; } h2 { font-size: clamp(28px, 4vw, 44px); line-height: 1.1; margin: 8px 0 22px; } p { margin: 0; } .subtitle { max-width: 560px; font-size: 18px; opacity: .88; } .button { display: inline-block; margin-top: 28px; padding: 13px 18px; border-radius: 999px; background: var(--accent); color: var(--ink); font-weight: 700; text-decoration: none; } section { padding: 68px clamp(24px, 7vw, 88px); } .intro { max-width: 650px; font-size: 20px; } .highlights, .services, .testimonials { display: grid; gap: 16px; } .highlights { grid-template-columns: repeat(3, 1fr); margin-top: 28px; } .highlight, .service, .quote { border: 1px solid #dfe4de; border-radius: var(--radius); background: white; padding: 22px; } .highlight { color: var(--primary); font-weight: 700; } .services { grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); } .service h3 { margin: 0 0 8px; font-size: 20px; } .price { color: var(--primary); font-weight: 700; margin-top: 16px; } .testimonials { grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); } blockquote { margin: 0; font-size: 18px; } cite { display: block; color: var(--muted); margin-top: 14px; font-style: normal; } .contact { background: #edf2ec; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; } .contact-list { display: grid; gap: 14px; color: var(--muted); } footer { padding: 28px clamp(24px, 7vw, 88px); color: white; background: var(--ink); display: flex; justify-content: space-between; gap: 20px; } footer a { color: var(--accent); } @media (max-width: 620px) { .hero { min-height: 520px; } .highlights, .contact { grid-template-columns: 1fr; } section { padding-top: 52px; padding-bottom: 52px; } footer { display: grid; } }
</style><style>
  .template-services { --paper: ${templatePalettes["template-services"].paperColor}; --ink: ${templatePalettes["template-services"].inkColor}; }
  .template-services .hero { min-height: 510px; align-items: center; border-bottom: 14px solid var(--accent); }
  .template-services .hero:after { width: 170px; height: 170px; right: 12%; top: 16%; border: 18px solid var(--accent); background: transparent; opacity: .75; }
  .template-services section:nth-of-type(1) { display: grid; grid-template-columns: .7fr 1.3fr; column-gap: 48px; align-items: start; }
  .template-services section:nth-of-type(1) .eyebrow { grid-column: 1; }
  .template-services section:nth-of-type(1) h2, .template-services section:nth-of-type(1) .intro, .template-services section:nth-of-type(1) .highlights { grid-column: 2; }
  .template-services .service { border: 0; border-left: 3px solid var(--accent); border-radius: 0; box-shadow: 0 8px 24px #26342b12; }
  .template-services .quote { background: transparent; border: 0; border-top: 1px solid #cbd2cb; border-radius: 0; padding-left: 0; }
  .template-services .contact { background: var(--ink); color: white; }

  .template-fnb { --paper: ${templatePalettes["template-fnb"].paperColor}; --ink: ${templatePalettes["template-fnb"].inkColor}; }
  .template-fnb .hero { min-height: 480px; border-radius: 0 0 42px 42px; background: var(--primary); }
  .template-fnb .hero:after { width: 310px; height: 310px; right: -70px; top: -80px; opacity: .34; }
  .template-fnb section:nth-of-type(2) { background: #fff0dc; }
  .template-fnb .service { border: 0; box-shadow: 0 12px 24px #7b3f0018; transform: rotate(-1deg); }
  .template-fnb .service:nth-child(even) { transform: rotate(1deg); }
  .template-fnb .price { display: inline-block; padding: 5px 10px; border-radius: 999px; background: var(--accent); color: var(--ink); }
  .template-fnb .highlight { border-radius: 999px; background: #fff0dc; text-align: center; }

  .template-retail { --paper: ${templatePalettes["template-retail"].paperColor}; --ink: ${templatePalettes["template-retail"].inkColor}; }
  .template-retail .hero { min-height: 390px; padding-top: 52px; border: 1px solid var(--ink); color: var(--ink); background: var(--paper); }
  .template-retail .hero:after { width: 42%; height: 100%; right: 0; top: 0; border-radius: 0; background: var(--accent); opacity: 1; }
  .template-retail .hero-content { max-width: 720px; }
  .template-retail .button { border-radius: 2px; background: var(--ink); color: white; }
  .template-retail section { border-bottom: 1px solid #c8ccc8; }
  .template-retail .highlights { grid-template-columns: repeat(3, 1fr); }
  .template-retail .service { border-radius: 0; border-color: var(--ink); background: transparent; box-shadow: 7px 7px 0 var(--accent); }
  .template-retail .price { border-top: 1px solid var(--ink); padding-top: 12px; }
  .template-retail .quote { border-radius: 0; background: var(--ink); color: white; }
  .template-retail .contact { background: var(--accent); }
</style></head><body><main class="page ${template.className}">
  <header class="hero"><div class="hero-content"><div class="eyebrow">${escapeHtml(state.meta.category)} / ${escapeHtml(template.label)}</div><h1>${escapeHtml(state.hero.title)}</h1><p class="subtitle">${escapeHtml(state.hero.subtitle)}</p><a class="button" href="${whatsapp}" target="_blank" rel="noreferrer">${escapeHtml(state.hero.ctaText)}</a></div></header>
  <section><div class="eyebrow">Tentang kami</div><h2>${escapeHtml(state.meta.businessName)}</h2><p class="intro">${escapeHtml(state.about.story)}</p><div class="highlights">${highlights.map((item) => `<div class="highlight">${escapeHtml(item)}</div>`).join("")}</div></section>
  <section><div class="eyebrow">Pilihan utama</div><h2>${escapeHtml(state.meta.tagline)}</h2><div class="services">${state.services.map((service) => `<article class="service">${service.iconKeyword ? `<div class="service-icon">${escapeHtml(service.iconKeyword)}</div>` : ""}<h3>${escapeHtml(service.name)}</h3><p>${escapeHtml(service.description)}</p><div class="price">${escapeHtml(service.priceEstimate)}</div></article>`).join("")}</div></section>
  <section><div class="eyebrow">Kata pelanggan</div><h2>Datang sebagai pelanggan, pulang jadi langganan.</h2><div class="testimonials">${testimonials.map((testimonial) => `<figure class="quote"><blockquote>“${escapeHtml(testimonial.review)}”</blockquote><cite>${escapeHtml(testimonial.customerName)}</cite></figure>`).join("")}</div></section>
  <section class="contact"><div><div class="eyebrow">Temukan kami</div><h2>Singgah kapan saja.</h2><p>${escapeHtml(state.contact.address)}</p></div><div class="contact-list"><a href="${whatsapp}" target="_blank" rel="noreferrer">WhatsApp / ${escapeHtml(state.contact.whatsappNumber)}</a><a href="https://instagram.com/${encodeURIComponent(instagram)}" target="_blank" rel="noreferrer">Instagram / @${escapeHtml(instagram)}</a></div></section>
  <footer><strong>${escapeHtml(state.meta.businessName)}</strong><span>${escapeHtml(state.meta.tagline)}</span></footer>
</main></body></html>`;
}
