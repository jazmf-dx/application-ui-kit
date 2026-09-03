import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { COMBOBOX_CREATE_PREFIX, Combobox, splitCreatedValues } from "./Combobox";

const items = [
  { value: "1", label: "渋谷店", badge: "12" },
  { value: "2", label: "新宿店", badge: "8" },
  { value: "3", label: "池袋店" },
];

// Base UI はポインタイベントの座標を見るため、happy-dom ではキーボードで開く。
const openWith = async (query: string) => {
  const input = screen.getByRole("combobox");
  input.focus();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  await waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("true"));
  fireEvent.change(input, { target: { value: query } });
  return input;
};

describe("splitCreatedValues", () => {
  it("既存の値と新規作成された名前を分ける", () => {
    expect(splitCreatedValues(["12", `${COMBOBOX_CREATE_PREFIX}新しいタグ`])).toEqual({
      values: ["12"],
      created: ["新しいタグ"],
    });
  });

  it("新規作成が無ければ created は空になる", () => {
    expect(splitCreatedValues(["1", "2"])).toEqual({ values: ["1", "2"], created: [] });
  });
});

describe("Combobox", () => {
  it("入力した文字列でラベルを絞り込む", async () => {
    render(<Combobox items={items} aria-label="店舗" />);
    await openWith("新宿");

    await waitFor(() => expect(screen.getByText("新宿店")).toBeTruthy());
    expect(screen.queryByText("渋谷店")).toBeNull();
  });

  it("badge は絞り込みの対象にしない", async () => {
    render(<Combobox items={items} aria-label="店舗" />);
    await openWith("12");

    await waitFor(() => expect(screen.queryByText("渋谷店")).toBeNull());
  });

  it("該当が無いときは emptyMessage を出す", async () => {
    render(<Combobox items={items} aria-label="店舗" emptyMessage="ありません" />);
    await openWith("横浜");

    await waitFor(() => expect(screen.getByText("ありません")).toBeTruthy());
  });

  it("creatable のとき、一覧に無い文字列で新規作成の項目を出す", async () => {
    render(<Combobox items={items} creatable aria-label="店舗" />);
    await openWith("横浜店");

    await waitFor(() => expect(screen.getByText("「横浜店」を新規作成")).toBeTruthy());
  });

  it("creatable でも、既存のラベルと一致する入力では新規作成を出さない", async () => {
    render(<Combobox items={items} creatable aria-label="店舗" />);
    await openWith("渋谷店");

    await waitFor(() => expect(screen.getByText("渋谷店")).toBeTruthy());
    expect(screen.queryByText("「渋谷店」を新規作成")).toBeNull();
  });

  it("新規作成を選ぶと接頭辞付きの値を返し、onCreate も呼ぶ", async () => {
    const onValueChange = vi.fn();
    const onCreate = vi.fn();
    render(
      <Combobox
        items={items}
        creatable
        onValueChange={onValueChange}
        onCreate={onCreate}
        aria-label="店舗"
      />,
    );
    await openWith("横浜店");

    await waitFor(() => expect(screen.getByText("「横浜店」を新規作成")).toBeTruthy());
    fireEvent.click(screen.getByText("「横浜店」を新規作成"));

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(`${COMBOBOX_CREATE_PREFIX}横浜店`),
    );
    expect(onCreate).toHaveBeenCalledWith("横浜店");
  });

  it("multiple のとき、選択済みをチップで出す", () => {
    render(<Combobox items={items} multiple value={["1", "3"]} aria-label="店舗" />);

    expect(screen.getByText("渋谷店")).toBeTruthy();
    expect(screen.getByText("池袋店")).toBeTruthy();
    expect(screen.getByRole("button", { name: "渋谷店 を外す" })).toBeTruthy();
  });

  it("multiple のとき、新規作成された値も名前でチップに出す", () => {
    render(
      <Combobox
        items={items}
        multiple
        creatable
        value={["1", `${COMBOBOX_CREATE_PREFIX}横浜店`]}
        aria-label="店舗"
      />,
    );

    expect(screen.getByText("横浜店")).toBeTruthy();
  });

  it("error のとき入力欄を aria-invalid にする", () => {
    render(<Combobox items={items} error aria-label="店舗" />);

    expect(screen.getByRole("combobox").getAttribute("aria-invalid")).toBe("true");
  });
});
