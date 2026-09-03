import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyButton, copyTextToClipboard } from "./CopyButton";

/** isSecureContext / clipboard / execCommand は環境依存なので、テストごとに固定する */
function stubSecureContext(secure: boolean) {
  Object.defineProperty(window, "isSecureContext", { value: secure, configurable: true });
}

function stubClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

function stubExecCommand(impl: () => boolean) {
  Object.defineProperty(document, "execCommand", { value: impl, configurable: true });
}

afterEach(() => {
  stubSecureContext(false);
  stubClipboard(undefined);
  stubExecCommand(() => false);
});

describe("copyTextToClipboard", () => {
  it("secure context では navigator.clipboard を使う", async () => {
    stubSecureContext(true);
    const writeText = vi.fn(() => Promise.resolve());
    stubClipboard(writeText);

    await expect(copyTextToClipboard("https://example.com/x")).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://example.com/x");
  });

  it("secure context でなければ execCommand('copy') へフォールバックする", async () => {
    stubSecureContext(false);
    const execCommand = vi.fn(() => true);
    stubExecCommand(execCommand);

    await expect(copyTextToClipboard("value")).resolves.toBe("copied");
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("clipboard API が reject しても execCommand で成功すれば copied", async () => {
    stubSecureContext(true);
    stubClipboard(() => Promise.reject(new Error("denied")));
    stubExecCommand(() => true);

    await expect(copyTextToClipboard("value")).resolves.toBe("copied");
  });

  it("全滅かつ退避先なしなら failed", async () => {
    await expect(copyTextToClipboard("value")).resolves.toBe("failed");
  });

  it("全滅でも退避先があれば選択したまま selected を返す", async () => {
    const input = document.createElement("input");
    input.value = "https://example.com/one-time";
    document.body.appendChild(input);

    await expect(copyTextToClipboard(input.value, input)).resolves.toBe("selected");
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
    input.remove();
  });
});

describe("CopyButton", () => {
  it("コピー成功でラベルが copiedLabel に変わり、feedbackDuration 後に戻る", async () => {
    stubSecureContext(true);
    stubClipboard(() => Promise.resolve());

    const { getByRole } = render(<CopyButton value="token" feedbackDuration={10} />);
    const button = getByRole("button");
    expect(button.textContent).toContain("コピー");

    fireEvent.click(button);
    await waitFor(() => expect(button.textContent).toContain("コピーしました"));
    await waitFor(() => expect(button.textContent).not.toContain("コピーしました"));
    expect(button.textContent).toContain("コピー");
  });

  it("全滅時は failedLabel を表示し、onCopyResult へ failed を渡す", async () => {
    const onCopyResult = vi.fn();
    const { getByRole } = render(<CopyButton value="token" onCopyResult={onCopyResult} />);

    fireEvent.click(getByRole("button"));
    await waitFor(() => expect(onCopyResult).toHaveBeenCalledWith("failed"));
    expect(getByRole("button").textContent).toContain("コピーできません");
  });

  it("fallbackSelectRef があれば selected を通知し、ボタンは idle のまま", async () => {
    const input = document.createElement("input");
    input.value = "one-time-url";
    document.body.appendChild(input);
    const onCopyResult = vi.fn();

    const { getByRole } = render(
      <CopyButton
        value={input.value}
        fallbackSelectRef={{ current: input }}
        onCopyResult={onCopyResult}
      />,
    );

    fireEvent.click(getByRole("button"));
    await waitFor(() => expect(onCopyResult).toHaveBeenCalledWith("selected"));
    // 案内文は呼び出し側の責務なので、ボタン自体は押し直せるラベルのまま
    expect(getByRole("button").textContent).toContain("コピー");
    expect(getByRole("button").textContent).not.toContain("コピーしました");
    input.remove();
  });
});
