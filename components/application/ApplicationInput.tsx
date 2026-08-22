/**
 * ApplicationInput - 共有 UI ライブラリのテキスト入力コンポーネント
 *
 * 見た目は CSS クラスの `input-field` に揃えている。
 * 同じ画面にサーバーレンダリングのフォームと React コンポーネントが並んでも段差が出ないようにするため。
 *
 * 画面側では ApplicationInput のみを使用し、素の <input> にクラスを直書きしないでください。
 */

import * as React from "react";
import { cn } from "../../lib/utils";

export interface ApplicationInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "size"> {
  /**
   * エラー状態。true にすると枠線が danger 色になる。
   *
   * <important>
   * 色だけでエラーを表現してはいけない（色覚特性のある利用者に伝わらない）。
   * 必ずエラーメッセージも表示する。ApplicationFormField を使えば自動で両方付く。
   * </important>
   */
  error?: boolean;

  /** 入力欄の前に表示するアイコン（検索アイコン等） */
  leftIcon?: React.ReactNode;

  /** 入力欄の後ろに表示するアイコン・ボタン（クリアボタン等） */
  rightIcon?: React.ReactNode;
}

/**
 * ApplicationInput コンポーネント
 *
 * @example
 * ```tsx
 * // 基本
 * <ApplicationInput placeholder="タイトルを入力" />
 *
 * // エラー状態（メッセージは別途表示すること）
 * <ApplicationInput error defaultValue="不正な値" />
 *
 * // アイコン付き
 * <ApplicationInput leftIcon={<Search className="w-4 h-4" />} placeholder="検索" />
 *
 * // ラベル・エラー・ヘルプをまとめる場合は ApplicationFormField を使う
 * <ApplicationFormField label="件名" required error="件名は必須です">
 *   <ApplicationInput error />
 * </ApplicationFormField>
 * ```
 */
export const ApplicationInput = React.forwardRef<HTMLInputElement, ApplicationInputProps>(
  ({ className, error = false, leftIcon, rightIcon, type = "text", ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        type={type}
        // エラー状態を支援技術にも伝える（色だけに頼らない）
        aria-invalid={error || undefined}
        className={cn(
          // bg-card は theme.css の `.input-field`（background-color: var(--color-card)）に合わせる。
          // bg-background にするとダークモードだけテンプレート側と地色がズレる。
          "w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
          error
            ? "border-danger focus:border-danger focus:ring-danger"
            : "border-input focus:border-ring focus:ring-ring",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className,
        )}
        {...props}
      />
    );

    // アイコンがなければ余計な wrapper を作らない（レイアウトへの影響を避ける）
    if (!leftIcon && !rightIcon) return input;

    return (
      <div className="relative w-full">
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        {input}
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);

ApplicationInput.displayName = "ApplicationInput";
