export function whatsappUrl(number: string, message: string): string {
  return `https://wa.me/${encodeURIComponent(number)}?text=${encodeURIComponent(message)}`;
}

export function instagramUrl(handle: string): string {
  return `https://instagram.com/${encodeURIComponent(handle.replace(/^@/, ""))}`;
}

export function instagramHandle(handle: string): string {
  return handle.replace(/^@/, "");
}
