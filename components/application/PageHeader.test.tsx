import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("見出しは既定で h1", () => {
    render(<PageHeader title="アイデア一覧" />);
    expect(screen.getByRole("heading", { level: 1, name: "アイデア一覧" })).toBeTruthy();
  });

  it("headingLevel で見出しのレベルを変えられる", () => {
    render(<PageHeader headingLevel={2} title="通知設定" />);
    expect(screen.getByRole("heading", { level: 2, name: "通知設定" })).toBeTruthy();
  });

  it("breadcrumbs に配列を渡すと Breadcrumbs を描く", () => {
    render(
      <PageHeader title="詳細" breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "詳細" }]} />,
    );
    expect(screen.getByRole("navigation", { name: "現在位置" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "ホーム" })).toBeTruthy();
  });

  it("breadcrumbs に ReactNode を渡すとそのまま置く", () => {
    render(<PageHeader title="詳細" breadcrumbs={<nav aria-label="独自">x</nav>} />);
    expect(screen.getByRole("navigation", { name: "独自" })).toBeTruthy();
  });

  it("description / actions / tabs のスロットを描く", () => {
    render(
      <PageHeader
        title="一覧"
        description="説明文"
        actions={<button type="button">新規作成</button>}
        tabs={<div role="tablist">tabs</div>}
      />,
    );
    expect(screen.getByText("説明文")).toBeTruthy();
    expect(screen.getByRole("button", { name: "新規作成" })).toBeTruthy();
    expect(screen.getByRole("tablist")).toBeTruthy();
  });
});
