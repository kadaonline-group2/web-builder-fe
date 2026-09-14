import { useState } from "react";
import { websiteApi } from "./api";
import { mockWebsite } from "./mock";
import { renderWebsite, templatePalettes } from "./renderer";
import {
  WebsiteApiError,
  type ChatMessage,
  type TemplateId,
  type WebsiteState,
} from "./types";

const quickPrompts = [
  "Ganti warna jadi navy",
  "Buat tampilannya lebih hangat",
  "Tambahkan nuansa lokal",
];

const templateOptions: Array<{ id: TemplateId; label: string; name: string }> =
  [
    { id: "template-services", label: "1", name: "Jasa" },
    { id: "template-fnb", label: "2", name: "F&B" },
    { id: "template-retail", label: "3", name: "Retail" },
  ];

function App() {
  const [website, setWebsite] = useState<WebsiteState>(mockWebsite);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [notice, setNotice] = useState("Preview siap diedit");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Ceritakan perubahan yang kamu inginkan. Aku akan memperbarui preview-nya.",
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
    setNotice("Menyusun perubahan...");
    try {
      const result = await websiteApi.revise({
        currentState: website,
        instruction: cleanPrompt,
      });
      setWebsite(result.state);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: result.isFallback
            ? "Preview diperbarui dengan data fallback. Coba instruksi lain untuk mengeksplorasi tampilannya."
            : "Preview diperbarui. Coba instruksi lain untuk mengeksplorasi tampilannya.",
        },
      ]);
      setNotice(
        result.isFallback
          ? result.fallbackReason
            ? `Preview diperbarui dengan fallback: ${result.fallbackReason}`
            : "Preview diperbarui dengan fallback"
          : "Preview diperbarui",
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

  return (
    <div className="app-shell">
      <aside className="chat-panel">
        <div className="brand-lockup">
          <span className="brand-mark">R</span>
          <div>
            <strong>Nama Studio</strong>
            <span>AI website builder</span>
          </div>
        </div>
        <div className="chat-heading">
          <p className="kicker">Workspace / Draft 01</p>
          <h1>Bangun situs yang terasa seperti kamu.</h1>
          <p>
            Mulai dari satu kalimat. Nama Studio akan menyusunnya jadi halaman
            yang siap dibagikan.
          </p>
        </div>
        <div className="message-list">
          {messages.map((message) => (
            <div className={`message ${message.role}`} key={message.id}>
              <span>
                {message.role === "assistant" ? "Nama Studio" : "Kamu"}
              </span>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <div className="composer">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey))
                void submitPrompt();
            }}
            placeholder="Contoh: ganti warna jadi navy"
            rows={3}
            disabled={isGenerating}
          />
          <div className="composer-footer">
            <span>Ctrl / Cmd + Enter</span>
            <button
              className="send-button"
              type="button"
              onClick={() => void submitPrompt()}
              disabled={isGenerating}
            >
              {isGenerating ? "..." : "Kirim"} <span>↗</span>
            </button>
          </div>
        </div>
        <div className="quick-prompts">
          <span className="kicker">Coba cepat</span>
          {quickPrompts.map((quickPrompt) => (
            <button
              type="button"
              key={quickPrompt}
              onClick={() => void submitPrompt(quickPrompt)}
            >
              {quickPrompt} <span>↗</span>
            </button>
          ))}
        </div>
      </aside>
      <main className="preview-panel">
        <header className="preview-toolbar">
          <div>
            <span className="live-dot" /> Live preview{" "}
            <span className="toolbar-divider">/</span>{" "}
            {website.meta.businessName}
          </div>
          <div className="toolbar-actions">
            <div
              className="template-control"
              aria-label="Pilih template website"
            >
              <span className="template-control-label">Template</span>
              <div
                className="template-buttons"
                role="group"
                aria-label="Pilihan template"
              >
                {templateOptions.map((template) => (
                  <button
                    className={
                      website.templateId === template.id ? "active" : ""
                    }
                    type="button"
                    key={template.id}
                    title={`Template ${template.label}: ${template.name}`}
                    aria-label={`Gunakan template ${template.label}: ${template.name}`}
                    aria-pressed={website.templateId === template.id}
                    disabled={isGenerating}
                    onClick={() =>
                      setWebsite((current) => ({
                        ...current,
                        theme: {
                          ...current.theme,
                          primaryColor:
                            templatePalettes[template.id].primaryColor,
                          accentColor:
                            templatePalettes[template.id].accentColor,
                        },
                        templateId: template.id,
                      }))
                    }
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="segmented-control">
              <button
                className={viewport === "desktop" ? "active" : ""}
                type="button"
                onClick={() => setViewport("desktop")}
              >
                Desktop
              </button>
              <button
                className={viewport === "mobile" ? "active" : ""}
                type="button"
                onClick={() => setViewport("mobile")}
              >
                Mobile
              </button>
            </div>
            <button
              className="download-button"
              type="button"
              onClick={() => void downloadWebsite()}
              disabled={isDownloading}
            >
              {isDownloading ? "..." : "Download"} <span>↓</span>
            </button>
          </div>
        </header>
        <div className="preview-stage">
          <div className={`browser-frame ${viewport}`}>
            <div className="browser-chrome">
              <span />
              <span />
              <span />
              <small>
                {website.meta.businessName.toLowerCase().replace(/\s+/g, "-")}
                .site
              </small>
            </div>
            <iframe title="Website preview" srcDoc={renderWebsite(website)} />
          </div>
        </div>
        <footer className="status-bar">
          <span>{notice}</span>
          <span>
            <i /> Mock data / v1.1 contract
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
