import { renderWebsite, templatePalettes } from "../renderer";
import type { TemplateId, WebsiteState } from "../types";

const templateOptions: Array<{ id: TemplateId; label: string; name: string }> =
  [
    { id: "template-services", label: "1", name: "Jasa" },
    { id: "template-fnb", label: "2", name: "F&B" },
    { id: "template-retail", label: "3", name: "Retail" },
  ];

interface PreviewPanelProps {
  website: WebsiteState;
  isSample: boolean;
  notice: string;
  viewport: "desktop" | "mobile";
  isGenerating: boolean;
  isDownloading: boolean;
  onViewportChange: (viewport: "desktop" | "mobile") => void;
  onTemplateChange: (templateId: TemplateId) => void;
  onDownload: () => void;
  onCopyHtml: () => void;
}

export function PreviewPanel({
  website,
  isSample,
  notice,
  viewport,
  isGenerating,
  isDownloading,
  onViewportChange,
  onTemplateChange,
  onDownload,
  onCopyHtml,
}: PreviewPanelProps) {
  return (
    <main className="preview-panel">
      <header className="preview-toolbar">
        <div>
          <span className="live-dot" />{" "}
          <span data-testid="preview-mode">
            {isSample ? "Preview contoh" : "Live preview"}
          </span>{" "}
          <span className="toolbar-divider">/</span>{" "}
          {website.meta.businessName}
        </div>
        <div className="toolbar-actions">
          <div className="template-control" aria-label="Pilih template website">
            <span className="template-control-label">Template</span>
            <div
              className="template-buttons"
              role="group"
              aria-label="Pilihan template"
            >
              {templateOptions.map((template) => (
                <button
                  className={website.templateId === template.id ? "active" : ""}
                  type="button"
                  key={template.id}
                  title={`Template ${template.label}: ${template.name}`}
                  aria-label={`Gunakan template ${template.label}: ${template.name}`}
                  aria-pressed={website.templateId === template.id}
                  disabled={isGenerating}
                  onClick={() => onTemplateChange(template.id)}
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
              onClick={() => onViewportChange("desktop")}
            >
              Desktop
            </button>
            <button
              className={viewport === "mobile" ? "active" : ""}
              type="button"
              onClick={() => onViewportChange("mobile")}
            >
              Mobile
            </button>
          </div>
          <button
            className="download-button"
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
          >
            {isDownloading ? "..." : "Download"} <span>↓</span>
          </button>
          <button
            className="copy-button"
            type="button"
            onClick={onCopyHtml}
            disabled={isDownloading}
          >
            Salin HTML
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
        <span role="status">{notice}</span>
        <span>
          <i /> {isSample ? "Preview contoh / kontrak v1.1" : "Kontrak v1.1"}
        </span>
      </footer>
    </main>
  );
}

export function applyTemplatePalette(
  website: WebsiteState,
  templateId: TemplateId,
): WebsiteState {
  const palette = templatePalettes[templateId];
  return {
    ...website,
    templateId,
    theme: {
      ...website.theme,
      primaryColor: palette.primaryColor,
      accentColor: palette.accentColor,
    },
  };
}
