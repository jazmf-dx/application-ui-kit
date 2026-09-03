import { fireEvent, render, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { RadioTable } from "./RadioTable";
import type { TableColumn } from "./Table";

type Plan = { id: string; name: string; users: number; price: number };

const PLANS: Plan[] = [
  { id: "light", name: "ライト", users: 10, price: 9800 },
  { id: "standard", name: "スタンダード", users: 50, price: 29800 },
  { id: "enterprise", name: "エンタープライズ", users: 300, price: 98000 },
];

const COLUMNS: TableColumn<Plan>[] = [
  { key: "name", header: "プラン", cell: (p) => p.name },
  { key: "users", header: "利用人数", align: "right", cell: (p) => `${p.users} 人` },
  { key: "price", header: "月額", align: "right", cell: (p) => `${p.price.toLocaleString()} 円` },
];

function renderTable(props: Partial<React.ComponentProps<typeof RadioTable<Plan>>> = {}) {
  return render(
    <RadioTable<Plan>
      columns={COLUMNS}
      rows={PLANS}
      rowValue={(p) => p.id}
      rowLabel={(p) => p.name}
      caption="プランの選択"
      {...props}
    />,
  );
}

describe("RadioTable", () => {
  it("行ごとにラジオを出し、読み上げ名は rowLabel を使う", () => {
    renderTable();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "スタンダード" })).toBeTruthy();
  });

  it("ラジオ列を先頭に足しても列見出しは崩れない", () => {
    renderTable();
    expect(screen.getByRole("columnheader", { name: "選択" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "月額" })).toBeTruthy();
  });

  it("行のどこを押しても選択できる（ドットだけを狙わせない）", () => {
    const onValueChange = vi.fn();
    renderTable({ onValueChange });
    fireEvent.click(screen.getByText("98,000 円"));
    expect(onValueChange).toHaveBeenCalledWith("enterprise");
  });

  it("非制御でも行クリックで選択状態が移る", () => {
    renderTable({ defaultValue: "light" });
    expect(screen.getByRole("radio", { name: "ライト" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByText("29,800 円"));
    expect(screen.getByRole("radio", { name: "スタンダード" }).getAttribute("aria-checked")).toBe(
      "true",
    );
    expect(screen.getByRole("radio", { name: "ライト" }).getAttribute("aria-checked")).toBe(
      "false",
    );
  });

  it("制御コンポーネントとして使うと value 以外は選択されない", () => {
    const onValueChange = vi.fn();
    renderTable({ value: "light", onValueChange });
    fireEvent.click(screen.getByText("29,800 円"));
    expect(onValueChange).toHaveBeenCalledWith("standard");
    // 親が value を更新しない限り選択は動かない
    expect(screen.getByRole("radio", { name: "ライト" }).getAttribute("aria-checked")).toBe("true");
  });

  it("rowDisabled の行は行クリックでも選べない", () => {
    const onValueChange = vi.fn();
    renderTable({ onValueChange, rowDisabled: (p) => p.id === "enterprise" });
    fireEvent.click(screen.getByText("98,000 円"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("表全体を disabled にすると選べない", () => {
    const onValueChange = vi.fn();
    renderTable({ onValueChange, disabled: true });
    fireEvent.click(screen.getByText("29,800 円"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("ラジオを直接クリックしても onValueChange は 1 回だけ呼ばれる", () => {
    const onValueChange = vi.fn();
    renderTable({ onValueChange });
    fireEvent.click(screen.getByRole("radio", { name: "スタンダード" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("standard");
  });

  it("読み上げ用ラベル経由でも onValueChange は 1 回だけ呼ばれる", () => {
    const onValueChange = vi.fn();
    const { container } = renderTable({ onValueChange });
    const label = container.querySelector<HTMLLabelElement>('label[for$="-standard"]');
    fireEvent.click(label as HTMLLabelElement);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("ラジオを直接クリックしても選択状態は移る", () => {
    renderTable({ defaultValue: "light" });
    fireEvent.click(screen.getByRole("radio", { name: "スタンダード" }));
    expect(screen.getByRole("radio", { name: "スタンダード" }).getAttribute("aria-checked")).toBe(
      "true",
    );
  });

  it("未選択から選択しても制御/非制御の警告を出さない", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    renderTable();
    fireEvent.click(screen.getByText("29,800 円"));
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("0 件のときは空状態の文言を出す", () => {
    renderTable({ rows: [], emptyMessage: "選べるプランがありません" });
    expect(screen.getByText("選べるプランがありません")).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("name を渡すとフォーム送信できる input になる", () => {
    const { container } = renderTable({ name: "plan", defaultValue: "standard" });
    const checked = container.querySelector<HTMLInputElement>('input[name="plan"]:checked');
    expect(checked?.value).toBe("standard");
  });
});
