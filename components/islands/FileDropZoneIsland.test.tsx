import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FileDropZoneIsland } from "./FileDropZoneIsland";

/** happy-dom に DataTransfer が無い場合の最小スタブ */
class DataTransferStub {
  private list: File[] = [];
  items = { add: (f: File) => this.list.push(f) };
  get files() {
    return this.list as unknown as FileList;
  }
}

describe("FileDropZoneIsland", () => {
  let input: HTMLInputElement;
  let written: FileList | null;

  beforeEach(() => {
    written = null;
    input = document.createElement("input");
    input.type = "file";
    input.id = "id_attachment";
    input.name = "attachment";
    input.accept = ".pdf";
    document.body.appendChild(input);
    // happy-dom は input.files の setter を持たないため、書き戻しを捕まえる
    Object.defineProperty(input, "files", {
      configurable: true,
      get: () => written ?? ([] as unknown as FileList),
      set: (value: FileList) => {
        written = value;
      },
    });
    if (typeof globalThis.DataTransfer === "undefined") {
      vi.stubGlobal("DataTransfer", DataTransferStub);
    }
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("元の input を hidden にし、accept を input から読む", () => {
    const { container } = render(<FileDropZoneIsland target="id_attachment" />);
    expect(input.hidden).toBe(true);
    // 自前の input は作らない（name の重複を避ける）
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });

  it("ドロップしたファイルを元の input に書き戻して change を発火する", () => {
    const onChange = vi.fn();
    input.addEventListener("change", onChange);
    const { container } = render(<FileDropZoneIsland target="id_attachment" />);

    const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
    fireEvent.drop(container.firstElementChild as HTMLElement, { dataTransfer: { files: [pdf] } });

    expect(written).not.toBeNull();
    expect(Array.from(written as unknown as File[]).map((f) => f.name)).toEqual(["a.pdf"]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText("a.pdf")).toBeTruthy();
  });

  it("input の accept に合わないファイルは弾く", () => {
    const { container } = render(<FileDropZoneIsland target="id_attachment" />);
    const txt = new File(["x"], "memo.txt", { type: "text/plain" });
    fireEvent.drop(container.firstElementChild as HTMLElement, { dataTransfer: { files: [txt] } });
    expect(written).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("memo.txt");
  });

  it("target が file input でなければ警告する", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<FileDropZoneIsland target="no-such-input" />);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
