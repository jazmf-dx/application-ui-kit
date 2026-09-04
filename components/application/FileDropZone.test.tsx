import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileDropZone } from "./FileDropZone";

const file = (name: string, size: number, type = "application/pdf") => {
  const f = new File(["x".repeat(size)], name, { type });
  return f;
};

function drop(zone: HTMLElement, files: File[]) {
  fireEvent.drop(zone, { dataTransfer: { files } });
}

describe("FileDropZone", () => {
  it("ドロップしたファイルを onFilesChange に渡す", () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileDropZone onFilesChange={onFilesChange} />);
    drop(container.firstElementChild as HTMLElement, [file("a.pdf", 10)]);
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(["a.pdf"]);
  });

  it("maxSize を超えるものは弾き、理由を role=alert で出す", () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileDropZone onFilesChange={onFilesChange} maxSize={100} multiple />,
    );
    drop(container.firstElementChild as HTMLElement, [file("big.pdf", 200), file("ok.pdf", 50)]);
    expect(screen.getByRole("alert").textContent).toContain("big.pdf");
    expect(onFilesChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(["ok.pdf"]);
  });

  it("accept に合わない種類は弾く（拡張子・MIME ワイルドカード）", () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileDropZone onFilesChange={onFilesChange} accept=".pdf,image/*" multiple />,
    );
    drop(container.firstElementChild as HTMLElement, [
      file("doc.pdf", 10),
      file("photo.png", 10, "image/png"),
      file("memo.txt", 10, "text/plain"),
    ]);
    expect(screen.getByRole("alert").textContent).toContain("memo.txt");
    expect(onFilesChange.mock.calls[0][0].map((f: File) => f.name)).toEqual([
      "doc.pdf",
      "photo.png",
    ]);
  });

  it("multiple でないときは 1 件だけにする", () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileDropZone onFilesChange={onFilesChange} />);
    drop(container.firstElementChild as HTMLElement, [file("a.pdf", 1), file("b.pdf", 1)]);
    expect(onFilesChange.mock.calls[0][0]).toHaveLength(1);
    expect(screen.getByRole("alert").textContent).toContain("1 件");
  });

  it("選択済み一覧の削除で残りを onFilesChange に渡す", () => {
    const onFilesChange = vi.fn();
    render(
      <FileDropZone
        files={[file("a.pdf", 1), file("b.pdf", 1)]}
        onFilesChange={onFilesChange}
        multiple
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "a.pdf を削除" }));
    expect(onFilesChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(["b.pdf"]);
  });

  it("onBrowse を渡すと内部の input を描かず、選択ボタンで onBrowse を呼ぶ", () => {
    const onBrowse = vi.fn();
    const { container } = render(<FileDropZone onFilesChange={() => {}} onBrowse={onBrowse} />);
    expect(container.querySelector('input[type="file"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "ファイルを選択" }));
    expect(onBrowse).toHaveBeenCalledTimes(1);
  });
});
