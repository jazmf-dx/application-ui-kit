import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs";

const ITEMS = [
  { label: "ホーム", href: "/" },
  { label: "アイデア", href: "/ideas/" },
  { label: "モニターの増設" },
];

describe("Breadcrumbs", () => {
  it("nav に読み上げラベルを付ける", () => {
    render(<Breadcrumbs items={ITEMS} />);
    expect(screen.getByRole("navigation", { name: "現在位置" })).toBeTruthy();
  });

  it("末尾は現在地（aria-current=page）でリンクにしない", () => {
    render(<Breadcrumbs items={ITEMS} />);
    const current = screen.getByText("モニターの増設");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.closest("a")).toBeNull();
  });

  it("途中の項目は href があればリンクになる", () => {
    render(<Breadcrumbs items={ITEMS} />);
    expect(screen.getByRole("link", { name: "アイデア" }).getAttribute("href")).toBe("/ideas/");
  });

  it("href の無い途中の項目はリンクにならない文字になる", () => {
    render(<Breadcrumbs items={[{ label: "管理" }, { label: "設定" }]} />);
    expect(screen.queryByRole("link", { name: "管理" })).toBeNull();
    expect(screen.getByText("管理")).toBeTruthy();
  });
});
