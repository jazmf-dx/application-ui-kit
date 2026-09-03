/**
 * CopyButton - 共有 UI ライブラリのコピー（クリップボード）ボタン
 *
 * ワンタイム URL・API トークン・ID など「画面に出した値を持ち帰らせる」場面で使う。
 * コピー処理は navigator.clipboard だけに頼らない。あれは **secure context 限定**で、
 * HTTPS でも localhost でもない社内配備（http://<IP>:<port>）では undefined になり、
 * ボタンが黙って何もしない状態になる。順に:
 *
 *   1. navigator.clipboard（HTTPS / localhost のとき）
 *   2. execCommand('copy')（http でも動く）
 *   3. どちらも駄目なら `fallbackSelect` の要素を選択したままにして手動コピーへ繋ぐ
 *
 * <important>
 * 一度しか表示されない値（ワンタイム URL 等）には、値が見える入力欄と組で使うこと
 * （Django テンプレートなら Islands の `copy-field`）。ボタン単体では 3 の
 * 「選択したまま手動コピー」への退避先がなく、コピーできないことに気付けないのが一番困る。
 * </important>
 */

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { Button, type ButtonProps } from "./Button";

/**
 * copyTextToClipboard の結果
 * - copied: クリップボードへ書き込めた
 * - selected: 書き込めなかったが `fallbackSelect` を選択済み（Ctrl+C を案内する）
 * - failed: 書き込めず、選択への退避先もなかった
 */
export type CopyResult = "copied" | "selected" | "failed";

function selectAll(element: HTMLInputElement | HTMLTextAreaElement): void {
  element.focus();
  element.select();
  // iOS Safari は select() だけでは効かない
  element.setSelectionRange(0, element.value.length);
}

/**
 * テキストをクリップボードへコピーする（secure context でなくても動くフォールバック付き）。
 *
 * `fallbackSelect` を渡すと先にその要素を全選択してから試みるため、
 * すべて失敗しても「選択済み → Ctrl+C」へ繋げられる（結果は "selected"）。
 */
export async function copyTextToClipboard(
  text: string,
  fallbackSelect?: HTMLInputElement | HTMLTextAreaElement | null,
): Promise<CopyResult> {
  // secure context では、選択・フォーカスを動かさず Clipboard API を先に試す。
  // 成功時にコピー元へフォーカスが移ると、連続コピーやキーボード操作がしにくくなる。
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      // 権限拒否などは下のフォールバックへ落とす
    }
  }

  if (fallbackSelect) {
    // execCommand は現在の選択範囲を写す。Clipboard API が使えなかった場合だけ
    // コピー元を選択し、全滅時もCtrl+Cへ引き継げる状態にする。
    selectAll(fallbackSelect);
    return execCommandCopy() ? "copied" : "selected";
  }

  // 退避先がない場合は画面外の textarea を選択して execCommand を試す
  const scratch = document.createElement("textarea");
  scratch.value = text;
  scratch.setAttribute("readonly", "");
  scratch.style.position = "fixed";
  scratch.style.left = "-9999px";
  document.body.appendChild(scratch);
  selectAll(scratch);
  const copied = execCommandCopy();
  scratch.remove();
  return copied ? "copied" : "failed";
}

function execCommandCopy(): boolean {
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  }
}

export interface CopyButtonProps
  extends Omit<ButtonProps, "children" | "loading" | "leftIcon" | "rightIcon"> {
  /** コピーする文字列 */
  value: string;

  /**
   * ボタンのラベル
   * @default "コピー"
   */
  label?: React.ReactNode;

  /**
   * コピー成功後 `feedbackDuration` の間表示するラベル
   * @default "コピーしました"
   */
  copiedLabel?: React.ReactNode;

  /**
   * コピーに失敗したとき表示するラベル（フォールバックも含め全滅した場合のみ）
   * @default "コピーできません"
   */
  failedLabel?: React.ReactNode;

  /**
   * 成功・失敗表示を出す時間（ミリ秒）
   * @default 2000
   */
  feedbackDuration?: number;

  /**
   * すべてのコピー手段が失敗したとき、選択状態にして手動コピー（Ctrl+C）へ
   * 繋ぐ入力要素。値が見える readonly の入力欄と組で使う場面で渡す。
   */
  fallbackSelectRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;

  /**
   * コピーを試みた結果の通知。"selected" のとき「Ctrl+C でコピーしてください」等の
   * 案内を出すのは呼び出し側の責務（ボタンのラベルには収まらないため）。
   */
  onCopyResult?: (result: CopyResult) => void;
}

/**
 * CopyButton コンポーネント
 *
 * @example
 * ```tsx
 * // 基本
 * <CopyButton value={apiToken} />
 *
 * // 値が見える入力欄と組にする（一度しか表示されない値はこの形にする）
 * const inputRef = React.useRef<HTMLInputElement>(null);
 * const [status, setStatus] = React.useState("");
 * <Input ref={inputRef} readOnly value={issuedUrl} />
 * <CopyButton
 *   value={issuedUrl}
 *   fallbackSelectRef={inputRef}
 *   onCopyResult={(result) => {
 *     if (result === "selected") setStatus("Ctrl+C（Mac は ⌘+C）でコピーしてください");
 *   }}
 * />
 * ```
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      label = "コピー",
      copiedLabel = "コピーしました",
      failedLabel = "コピーできません",
      feedbackDuration = 2000,
      fallbackSelectRef,
      onCopyResult,
      variant = "secondary",
      onClick,
      ...props
    },
    ref,
  ) => {
    const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    const handleClick: NonNullable<ButtonProps["onClick"]> = async (event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      const result = await copyTextToClipboard(value, fallbackSelectRef?.current);
      onCopyResult?.(result);

      // "selected" は失敗ではなく手動コピーへの引き継ぎ。案内は呼び出し側が
      // 出すので、ボタンは押し直せる見た目（idle）のままにする。
      setState(result === "copied" ? "copied" : result === "failed" ? "failed" : "idle");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setState("idle"), feedbackDuration);
    };

    return (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        leftIcon={state === "copied" ? <CheckIcon /> : <CopyIcon />}
        onClick={handleClick}
        {...props}
      >
        {/* ラベル差し替えを支援技術にも伝える。視覚上はボタン文言の変化と同じもの */}
        <span aria-live="polite">
          {state === "copied" ? copiedLabel : state === "failed" ? failedLabel : label}
        </span>
      </Button>
    );
  },
);

CopyButton.displayName = "CopyButton";
