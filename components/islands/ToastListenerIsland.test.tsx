import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "../application/Toast";
import { ToastListenerIsland } from "./ToastListenerIsland";

describe("ToastListenerIsland", () => {
  afterEach(() => {
    (window as unknown as Record<string, unknown>).DxToast = undefined;
    window.__applicationToastQueue = undefined;
    vi.restoreAllMocks();
  });

  it("globalAliases で同じ実体を別名にも登録する", () => {
    render(<ToastListenerIsland globalAliases={["DxToast"]} />);
    expect(window.ApplicationToast).toBe(toast);
    expect((window as unknown as Record<string, unknown>).DxToast).toBe(toast);
  });

  it("マウント前に溜まったキューを消化して空にする", () => {
    const success = vi.spyOn(toast, "success").mockImplementation(() => {});
    window.__applicationToastQueue = [["success", "保存しました", "詳細"]];
    render(<ToastListenerIsland />);
    expect(success).toHaveBeenCalledWith("保存しました", "詳細");
    expect(window.__applicationToastQueue).toHaveLength(0);
  });

  it("application-toast CustomEvent を受けて toast を出す（type 不明は info）", () => {
    const error = vi.spyOn(toast, "error").mockImplementation(() => {});
    const info = vi.spyOn(toast, "info").mockImplementation(() => {});
    render(<ToastListenerIsland />);

    act(() => {
      document.body.dispatchEvent(
        new CustomEvent("application-toast", {
          bubbles: true,
          detail: { type: "error", title: "失敗しました", description: "再試行してください" },
        }),
      );
      document.body.dispatchEvent(
        new CustomEvent("application-toast", {
          bubbles: true,
          detail: { type: "weird", text: "案内" },
        }),
      );
    });

    expect(error).toHaveBeenCalledWith("失敗しました", "再試行してください");
    expect(info).toHaveBeenCalledWith("案内", undefined);
  });
});
