import { useEffect, useRef, useState } from "react";
import { websiteApi } from "./api";
import { copyText } from "./clipboard";
import { ChatPanel } from "./components/ChatPanel";
import { applyTemplatePalette, PreviewPanel } from "./components/PreviewPanel";
import { mockWebsite } from "./mock";
import { renderWebsite } from "./renderer";
import {
  WebsiteApiError,
  type ChatMessage,
  type TemplateId,
  type WebsiteState,
} from "./types";

const generateSteps = [
  "Menyusun hero section...",
  "Menyusun tentang kami...",
  "Menyusun layanan dan testimoni...",
];

const reviseSteps = [
  "Menerapkan perubahan...",
  "Menjaga section lain tetap utuh...",
];

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
  const [progressText, setProgressText] = useState(generateSteps[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Ceritakan usaha kamu. Sertakan nama, produk atau layanan, lokasi, dan nomor WhatsApp. Aku akan menyusun draft pertamanya.",
    },
  ]);

  useEffect(() => {
    if (!isGenerating) return;
    const steps = hasGenerated ? reviseSteps : generateSteps;
    setProgressText(steps[0]);
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % steps.length;
      setProgressText(steps[index]);
    }, 700);
    return () => window.clearInterval(timer);
  }, [isGenerating, hasGenerated]);

  async function submitPrompt(value = prompt) {
    if (isGenerating) return;
    const cleanPrompt = value.trim();
    if (!cleanPrompt) {
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

  async function copyHtml() {
    try {
      await copyText(renderWebsite(websiteRef.current));
      setNotice("Kode HTML disalin ke clipboard");
    } catch {
      setNotice("Gagal menyalin HTML. Coba unduh filenya.");
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
        progressText={progressText}
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
        onCopyHtml={() => void copyHtml()}
      />
    </div>
  );
}

export default App;
