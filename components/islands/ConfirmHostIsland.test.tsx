import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmHostIsland } from "./ConfirmHostIsland";

/** state 更新を伴うイベントは act で包む（React の警告はテスト失敗になる） */
function dispatchConfirmModal(detail: Record<string, unknown>) {
  act(() => {
    document.dispatchEvent(new CustomEvent("confirm-modal", { detail }));
  });
}

function dispatchHtmxConfirm(question: string | undefined, elt: HTMLElement) {
  const issueRequest = vi.fn();
  const event = new CustomEvent("htmx:confirm", {
    bubbles: true,
    cancelable: true,
    detail: { question, elt, issueRequest },
  });
  act(() => {
    document.body.dispatchEvent(event);
  });
  return { event, issueRequest };
}

describe("ConfirmHostIsland", () => {
  afterEach(() => {
    // owner ガードを解放するため、テストごとに確実にアンマウントする
    cleanup();
  });

  describe("confirm-modal CustomEvent", () => {
    it("detail の文言でダイアログを開き、確定で onConfirm を呼ぶ", async () => {
      const onConfirm = vi.fn();
      render(<ConfirmHostIsland />);

      dispatchConfirmModal({
        title: "アイデアを削除",
        message: "取り消せません。",
        confirmText: "削除",
        onConfirm,
      });

      expect(await screen.findByText("取り消せません。")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "削除" }));
      await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    });

    it("title が無ければ既定の「確認」を使う", async () => {
      render(<ConfirmHostIsland />);
      dispatchConfirmModal({ message: "実行しますか？" });
      expect(await screen.findByText("確認")).toBeTruthy();
    });

    it("キャンセルすると onCancel を呼び、onConfirm は呼ばない", async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      render(<ConfirmHostIsland />);
      dispatchConfirmModal({ message: "実行しますか？", onConfirm, onCancel });
      await screen.findByText("実行しますか？");
      fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
      await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("url があれば CSRF ヘッダ付きで fetch し、成功後に onConfirm を呼ぶ", async () => {
      document.cookie = "csrftoken=tok123";
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
      vi.stubGlobal("fetch", fetchMock);
      const onConfirm = vi.fn();
      render(<ConfirmHostIsland />);
      dispatchConfirmModal({
        message: "削除しますか？",
        url: "/ideas/15/delete/",
        method: "DELETE",
        onConfirm,
      });
      await screen.findByText("削除しますか？");
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
      expect(fetchMock).toHaveBeenCalledWith(
        "/ideas/15/delete/",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({ "X-CSRFToken": "tok123" }),
        }),
      );
      vi.unstubAllGlobals();
      document.cookie = "csrftoken=";
    });
  });

  describe("htmx:confirm の横取り", () => {
    it("interceptHxConfirm が無ければ触らない", () => {
      render(<ConfirmHostIsland />);
      const { event } = dispatchHtmxConfirm("削除しますか？", document.createElement("button"));
      expect(event.defaultPrevented).toBe(false);
    });

    it("question の無いリクエストは触らない", () => {
      render(<ConfirmHostIsland interceptHxConfirm />);
      const { event } = dispatchHtmxConfirm(undefined, document.createElement("button"));
      expect(event.defaultPrevented).toBe(false);
    });

    it("hx-confirm の文言で開き、確定で issueRequest(true) を呼ぶ。data-confirm-* で上書きできる", async () => {
      render(<ConfirmHostIsland interceptHxConfirm />);
      const button = document.createElement("button");
      button.dataset.confirmTitle = "アイデアの削除";
      button.dataset.confirmText = "削除する";
      const { event, issueRequest } = dispatchHtmxConfirm("このアイデアを削除しますか？", button);

      expect(event.defaultPrevented).toBe(true);
      expect(await screen.findByText("このアイデアを削除しますか？")).toBeTruthy();
      expect(screen.getByText("アイデアの削除")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "削除する" }));
      await waitFor(() => expect(issueRequest).toHaveBeenCalledWith(true));
    });

    it("キャンセルでは issueRequest を呼ばない", async () => {
      render(<ConfirmHostIsland interceptHxConfirm />);
      const { issueRequest } = dispatchHtmxConfirm(
        "削除しますか？",
        document.createElement("button"),
      );
      await screen.findByText("削除しますか？");
      fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
      await waitFor(() => expect(screen.queryByText("削除しますか？")).toBeNull());
      expect(issueRequest).not.toHaveBeenCalled();
    });
  });

  it("2 つ目の confirm-host は警告を出して何もしない", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        <ConfirmHostIsland interceptHxConfirm />
        <ConfirmHostIsland interceptHxConfirm />
      </>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("1 つだけ"));
    const { event } = dispatchHtmxConfirm("削除しますか？", document.createElement("button"));
    // 1 つ目だけが握る
    expect(event.defaultPrevented).toBe(true);
    warn.mockRestore();
  });
});
