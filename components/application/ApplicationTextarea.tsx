/**
 * ApplicationTextarea - 共有 UI ライブラリの複数行テキスト入力コンポーネント
 *
 * 見た目は ApplicationInput（`input-field` クラス相当）に揃えている。
 * 画面側では ApplicationTextarea のみを使用し、素の <textarea> にクラスを直書きしないでください。
 */

import * as React from "react";
import { cn } from "../../lib/utils";

export interface ApplicationTextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  /**
   * エラー状態。true にすると枠線が danger 色になる。
   *
   * <important>
   * 色だけでエラーを表現してはいけない。必ずエラーメッセージも表示する。
   * ApplicationFormField を使えば自動で両方付く。
   * </important>
   */
  error?: boolean;

  /**
   * 縦方向のリサイズ可否
   * @default "vertical"
   */
  resize?: "none" | "vertical";
}

/**
 * ApplicationTextarea コンポーネント
 *
 * @example
 * ```tsx
 * // 基本
 * <ApplicationTextarea placeholder="詳細を入力してください" rows={4} />
 *
 * // エラー状態（メッセージは別途表示すること）
 * <ApplicationTextarea error defaultValue="不正な値" />
 *
 * // ラベル・エラー・ヘルプをまとめる場合は ApplicationFormField を使う
 * <ApplicationFormField label="詳細" required error="詳細は必須です">
 *   <ApplicationTextarea error />
 * </ApplicationFormField>
 * ```
 */
export const ApplicationTextarea = React.forwardRef<HTMLTextAreaElement, ApplicationTextareaProps>(
  ({ className, error = false, resize = "vertical", rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={error || undefined}
        className={cn(
          // 地色は ApplicationInput と同じく `.input-field` に合わせる（bg-card）。
          "w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
          resize === "none" ? "resize-none" : "resize-y",
          error
            ? "border-danger focus:border-danger focus:ring-danger"
            : "border-input focus:border-ring focus:ring-ring",
          className,
        )}
        {...props}
      />
    );
  },
);

ApplicationTextarea.displayName = "ApplicationTextarea";
