/**
 * CopyFieldIsland - Django テンプレートから宣言的に使えるコピー欄
 *
 * ワンタイム URL・API トークンなど「画面に出した値を持ち帰らせる」ための
 * readonly 入力欄 + コピーボタン + 案内行の一式です。Django テンプレートに
 * 以下のように書くだけで使用できます:
 *
 * ```html
 * <div data-react="copy-field" data-value="{{ issued_link }}"></div>
 * ```
 *
 * コピー処理は secure context でなくても動きます（navigator.clipboard →
 * execCommand の順で試し、全滅なら値を選択したまま Ctrl+C を案内する）。
 * 一度しか表示されない値でも「コピーできたつもりで失えた」を作らないための
 * 三段構えです。
 *
 * <important>
 * `data-props` に Django の値を渡すときは、文字列連結で JSON を組み立てず
 * `json_script` 等の安全なシリアライズ手段を使ってください（XSS）。
 * </important>
 */

import { useRef, useState } from "react";
import { CopyButton, type CopyResult } from "../application/CopyButton";
import { Input } from "../application/Input";

export interface CopyFieldIslandProps {
  /** コピーする値。入力欄にそのまま表示される */
  value: string;

  /**
   * コピーボタンのラベル
   * @default "コピー"
   */
  copyLabel?: string;

  /**
   * すべてのコピー手段が失敗し、値を選択したままにしたときの案内
   * @default "値を選択しました。Ctrl+C（Mac は ⌘+C）でコピーしてください。"
   */
  selectedMessage?: string;

  /**
   * 入力欄の aria-label（視覚ラベルは周囲の見出しが担う想定）
   * @default "コピーする値"
   */
  inputAriaLabel?: string;
}

export function CopyFieldIsland({
  value,
  copyLabel = "コピー",
  selectedMessage = "値を選択しました。Ctrl+C（Mac は ⌘+C）でコピーしてください。",
  inputAriaLabel = "コピーする値",
}: CopyFieldIslandProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  // data-value 経由だと "1234" のような値が parse-props で数値になる。コピー欄の
  // 値は常に文字列として扱う
  const text = String(value);

  const handleCopyResult = (result: CopyResult) => {
    // 成功はボタン自身が「コピーしました」に変わって伝える（aria-live 込み）。
    // ここで同じ文言を重ねると読み上げが二重になるため、案内行は
    // 手動コピーへの引き継ぎだけを担う。
    setStatus(result === "copied" ? "" : selectedMessage);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          readOnly
          value={text}
          aria-label={inputAriaLabel}
          className="font-mono"
        />
        <CopyButton
          className="shrink-0"
          value={text}
          label={copyLabel}
          fallbackSelectRef={inputRef}
          onCopyResult={handleCopyResult}
        />
      </div>
      {/* aria-live は「先に空で置いてから中身を変える」必要がある（後から要素ごと
          現れた文言は読み上げられないことがある）ため、空でも描画しておく */}
      <p role="status" aria-live="polite" className="mt-2 text-xs text-muted-foreground">
        {status}
      </p>
    </div>
  );
}
