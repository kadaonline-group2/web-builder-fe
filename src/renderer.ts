import type { WebsiteState } from "./types";
import { renderFnbTemplate } from "./rendering/template-fnb";
import { renderRetailTemplate } from "./rendering/template-retail";
import { renderServicesTemplate } from "./rendering/template-services";
import { templatePalettes } from "./rendering/theme";

export { templatePalettes };

// Preview and mock export share this renderer. Backend ZIP export must use
// the same output to stay identical to the iframe.
export function renderWebsite(state: WebsiteState): string {
  if (state.templateId === "template-fnb") return renderFnbTemplate(state);
  if (state.templateId === "template-retail") return renderRetailTemplate(state);
  return renderServicesTemplate(state);
}
