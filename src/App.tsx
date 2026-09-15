import { useRef, useState } from "react";
import { websiteApi } from "./api";
import { ChatPanel } from "./components/ChatPanel";
import { applyTemplatePalette, PreviewPanel } from "./components/PreviewPanel";
import { mockWebsite } from "./mock";
import { WebsiteApiError, type ChatMessage, type TemplateId, type WebsiteState } from "./types";

function App() {
  const [website, setWebsite] = useState<WebsiteState>(mockWebsite);
  const [hasGenerated, setHasGenerated] = useState(false);
  const websiteRef = useRef(website);
  websiteRef.current = website;
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [notice, setNotice] = useState("Preview contoh siap diedit");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Ceritakan usaha kamu. Sertakan nama, produk atau layanan, lokasi, dan nomor WhatsApp. Aku akan menyusun draft pertamanya.",
    },
  ]);

  async function submitPrompt(value = prompt) {
    const cleanPrompt = value.trim();
    if (!cleanPrompt || isGenerating) {
      setNotice("Tulis instruksi dulu sebelum mengirim.");
      return;
    }

    setPrompt("");
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: cleanPrompt },
    ]);
    setIsGenerating(true);
    setNotice(hasGenerated ? "Menyusun revisi..." : "Menyusun draft pertama...");
    try {
      const result = hasGenerated
        ? await websiteApi.revise({
            currentState: websiteRef.current,
            instruction: cleanPrompt,
          })
        : await websiteApi.generate({ businessDescription: cleanPrompt });
      setWebsite(result.state);
      setHasGenerated(true);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: result.isFallback
            ? "Preview diperbarui dengan data fallback. Coba instruksi lain untuk mengeksplorasi tampilannya."
            : hasGenerated
              ? "Preview diperbarui. Coba instruksi lain untuk mengeksplorasi tampilannya."
              : "Draft pertama siap. Minta perubahan warna, teks, atau tambah item lewat chat.",
        },
      ]);
      setNotice(
        result.isFallback
          ? result.fallbackReason
            ? `Preview diperbarui dengan fallback: ${result.fallbackReason}`
            : "Preview diperbarui dengan fallback"
          : hasGenerated
            ? "Preview diperbarui"
            : "Draft pertama siap",
      );
    } catch (error) {
      setNotice(
        error instanceof WebsiteApiError
          ? error.message
          : "Perubahan gagal dibuat. Coba lagi.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function downloadWebsite() {
    setIsDownloading(true);
    setNotice("Menyiapkan file website...");
    try {
      await websiteApi.download(website);
      setNotice("File website siap diunduh");
    } catch (error) {
      setNotice(
        error instanceof WebsiteApiError
          ? error.message
          : "Export website gagal. Coba lagi.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  function changeTemplate(templateId: TemplateId) {
    setWebsite((current) => applyTemplatePalette(current, templateId));
  }

  return (
    <div className="app-shell">
      <ChatPanel
        messages={messages}
        prompt={prompt}
        isGenerating={isGenerating}
        hasGenerated={hasGenerated}
        onPromptChange={setPrompt}
        onSubmit={(value) => void submitPrompt(value)}
      />
      <PreviewPanel
        website={website}
        isSample={!hasGenerated}
        notice={notice}
        viewport={viewport}
        isGenerating={isGenerating}
        isDownloading={isDownloading}
        onViewportChange={setViewport}
        onTemplateChange={changeTemplate}
        onDownload={() => void downloadWebsite()}
      />
    </div>
  );
}

export default App;
