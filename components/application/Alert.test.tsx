import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders title and body", () => {
    render(<Alert title="下書きを保存しました">30 日間保存されます。</Alert>);
    expect(screen.getByText("下書きを保存しました")).toBeTruthy();
    expect(screen.getByText("30 日間保存されます。")).toBeTruthy();
  });

  /* danger / warning は即時に読み上げる（role=alert）。info / success は状態（role=status）。 */
  it.each([
    ["info", "status"],
    ["success", "status"],
    ["warning", "alert"],
    ["danger", "alert"],
  ] as const)("tone=%s は role=%s", (tone, role) => {
    render(<Alert tone={tone} title="見出し" />);
    expect(screen.getByRole(role).getAttribute("data-tone")).toBe(tone);
  });

  it("onDismiss を渡すと閉じるボタンが出て、押すと呼ばれる", () => {
    const onDismiss = vi.fn();
    render(<Alert title="見出し" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("onDismiss が無ければ閉じるボタンを出さない", () => {
    render(<Alert title="見出し" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("icon={false} でアイコンを消せる", () => {
    const { container } = render(<Alert title="見出し" icon={false} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("variant=banner はバナー用クラスを持つ", () => {
    render(<Alert variant="banner" title="メンテナンスのお知らせ" />);
    expect(screen.getByRole("status").className).toContain("cn-alert-banner");
  });
});
