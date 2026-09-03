import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox";

/** indicator（アイコンを包む span）を取り出す */
function indicatorOf(checkbox: HTMLElement) {
  const indicator = checkbox.querySelector('[data-slot="checkbox-indicator"]');
  expect(indicator).toBeTruthy();
  return indicator as HTMLElement;
}

describe("Checkbox", () => {
  it("ラベルとチェックボックスを紐づける", () => {
    render(<Checkbox label="利用規約に同意する" />);
    expect(screen.getByRole("checkbox", { name: "利用規約に同意する" })).toBeTruthy();
  });

  it("チェック済みはチェックのアイコンを出す", () => {
    render(<Checkbox label="チェック済み" defaultChecked />);

    const indicator = indicatorOf(screen.getByRole("checkbox"));
    expect(indicator.hasAttribute("data-indeterminate")).toBe(false);
    expect(
      indicator.querySelector(".cn-checkbox-indicator-icon-checked.lucide-check"),
    ).toBeTruthy();
  });

  /** 一部選択がチェック済みと同じ見た目になる回帰を防ぐ */
  it("indeterminate はダッシュのアイコンを出し、data-indeterminate を持つ", () => {
    render(<Checkbox label="すべて選択" indeterminate />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");

    const indicator = indicatorOf(checkbox);
    // data-indeterminate が cn-checkbox-indicator-icon-* の出し分けの起点になる
    expect(indicator.hasAttribute("data-indeterminate")).toBe(true);
    expect(indicator.hasAttribute("data-checked")).toBe(false);
    expect(
      indicator.querySelector(".cn-checkbox-indicator-icon-indeterminate.lucide-minus"),
    ).toBeTruthy();
  });
});
