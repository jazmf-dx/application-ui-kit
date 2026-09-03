import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, type RadioGroupItem } from "./RadioGroup";

const SHIPPING: RadioGroupItem[] = [
  { value: "standard", label: "通常配送", description: "3〜5営業日", meta: "無料" },
  { value: "express", label: "速達", description: "翌営業日", meta: "550円" },
  { value: "pickup", label: "店舗受取（準備中）", disabled: true },
];

describe("RadioGroup", () => {
  it("ラベルの文字クリックで選択できる（ドットだけを狙わせない）", () => {
    const onValueChange = vi.fn();
    render(<RadioGroup items={SHIPPING} defaultValue="standard" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByText("速達"));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe("express");
  });

  it("読み上げ名がラベルから付く", () => {
    render(<RadioGroup items={SHIPPING} defaultValue="standard" />);
    expect(screen.getByRole("radio", { name: "通常配送" })).toBeTruthy();
  });

  it("同じ画面に name なしのグループが2つあっても id が衝突しない", () => {
    const first = vi.fn();
    const second = vi.fn();
    render(
      <>
        <RadioGroup items={SHIPPING} defaultValue="standard" onValueChange={first} />
        <RadioGroup items={SHIPPING} defaultValue="standard" onValueChange={second} />
      </>,
    );
    // 2つ目のグループのラベルを押しても、1つ目のグループは動かない
    const labels = screen.getAllByText("速達");
    fireEvent.click(labels[1] as HTMLElement);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it("disabled の選択肢は選べない", () => {
    const onValueChange = vi.fn();
    render(<RadioGroup items={SHIPPING} defaultValue="standard" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByText("店舗受取（準備中）"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  describe('variant="cards"', () => {
    it("カードのどこを押しても1回だけ選択が通る", () => {
      const onValueChange = vi.fn();
      render(
        <RadioGroup
          variant="cards"
          items={SHIPPING}
          defaultValue="standard"
          onValueChange={onValueChange}
        />,
      );
      // 説明文（ラベル本体ではない場所）を押しても選択される
      fireEvent.click(screen.getByText("翌営業日"));
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls[0]?.[0]).toBe("express");
    });

    it("ドットを直接押しても二重に発火しない", () => {
      const onValueChange = vi.fn();
      render(
        <RadioGroup
          variant="cards"
          items={SHIPPING}
          defaultValue="standard"
          onValueChange={onValueChange}
        />,
      );
      fireEvent.click(screen.getByRole("radio", { name: "速達" }));
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    it("meta と description を表示する", () => {
      render(<RadioGroup variant="cards" items={SHIPPING} defaultValue="standard" />);
      expect(screen.getByText("550円")).toBeTruthy();
      expect(screen.getByText("3〜5営業日")).toBeTruthy();
    });
  });
});
