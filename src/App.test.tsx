import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { sampleWebsite } from "./test/fixtures";
import { WebsiteApiError } from "./types";

const generate = vi.fn();
const revise = vi.fn();
const download = vi.fn();
const copyText = vi.fn();

vi.mock("./api", () => ({
  websiteApi: {
    generate: (...args: unknown[]) => generate(...args),
    revise: (...args: unknown[]) => revise(...args),
    download: (...args: unknown[]) => download(...args),
  },
}));

vi.mock("./clipboard", () => ({
  copyText: (...args: unknown[]) => copyText(...args),
}));

describe("App workflow", () => {
  beforeEach(() => {
    generate.mockReset();
    revise.mockReset();
    download.mockReset();
    copyText.mockReset();
    copyText.mockResolvedValue(undefined);
    generate.mockResolvedValue({
      state: {
        ...sampleWebsite,
        hero: { ...sampleWebsite.hero, title: "Draft pertama" },
      },
      isFallback: false,
    });
    revise.mockResolvedValue({
      state: {
        ...sampleWebsite,
        theme: {
          ...sampleWebsite.theme,
          primaryColor: "#5C3317",
        },
      },
      isFallback: false,
    });
  });

  it("labels the initial preview as a sample and generates on first submit", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByTestId("preview-mode")).toHaveTextContent("Preview contoh");
    const input = screen.getByPlaceholderText(/contoh:/i);
    await user.type(
      input,
      "Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya",
    );
    await user.click(screen.getByRole("button", { name: /kirim/i }));
    await waitFor(() => {
      expect(generate).toHaveBeenCalledTimes(1);
    });
    expect(revise).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId("preview-mode")).toHaveTextContent("Live preview");
    });
    expect(screen.getByTitle("Website preview")).toHaveAttribute(
      "srcdoc",
      expect.stringContaining("Draft pertama"),
    );
  });

  it("revises with the full current state after the first draft exists", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /contoh usaha kopi/i }));
    await waitFor(() => expect(generate).toHaveBeenCalledTimes(1));
    await user.type(
      screen.getByPlaceholderText(/contoh:/i),
      "Ganti nuansa warna jadi cokelat tua klasik",
    );
    await user.keyboard("{Enter}");
    await waitFor(() => expect(revise).toHaveBeenCalledTimes(1));
    expect(revise.mock.calls[0][0].currentState.hero.title).toBe("Draft pertama");
    expect(revise.mock.calls[0][0].instruction).toContain("cokelat tua klasik");
  });

  it("keeps the current preview when generate fails", async () => {
    generate.mockRejectedValue(
      new WebsiteApiError({
        code: "LLM_UNAVAILABLE",
        message: "Layanan AI sedang tidak tersedia.",
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText(/contoh:/i), "Usaha jasa desain");
    await user.click(screen.getByRole("button", { name: /kirim/i }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Layanan AI sedang tidak tersedia.",
      );
    });
    expect(screen.getByTestId("preview-mode")).toHaveTextContent("Preview contoh");
    expect(screen.getByTitle("Website preview")).toHaveAttribute(
      "srcdoc",
      expect.stringContaining("Warung Kopi Sejahtera"),
    );
  });

  it("explains fallback responses without blocking the new state", async () => {
    generate.mockResolvedValue({
      state: sampleWebsite,
      isFallback: true,
      fallbackReason: "REVISION_FAILED",
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /contoh usaha kopi/i }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/fallback/i);
    });
    expect(screen.getByTestId("preview-mode")).toHaveTextContent("Live preview");
  });

  it("does not submit blank messages", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /kirim/i }));
    expect(generate).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/instruksi/i);
  });

  it("shows stepwise progress while generating", async () => {
    let finishGenerate: ((value: unknown) => void) | undefined;
    generate.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishGenerate = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /contoh usaha kopi/i }));
    expect(await screen.findByTestId("progress-status")).toHaveTextContent(
      /menyusun hero section/i,
    );
    finishGenerate?.({
      state: {
        ...sampleWebsite,
        hero: { ...sampleWebsite.hero, title: "Draft pertama" },
      },
      isFallback: false,
    });
    await waitFor(() => {
      expect(screen.queryByTestId("progress-status")).not.toBeInTheDocument();
    });
  });

  it("copies standalone HTML as an export fallback", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Salin HTML" }));
    await waitFor(() => {
      expect(copyText).toHaveBeenCalledTimes(1);
    });
    expect(String(copyText.mock.calls[0][0])).toContain("Warung Kopi Sejahtera");
    expect(String(copyText.mock.calls[0][0])).toContain(
      "https://wa.me/628123456789",
    );
    expect(screen.getByRole("status")).toHaveTextContent(/disalin/i);
  });
});
