/**
 * Textarea - 複数行のテキスト入力
 *
 * shadcn/ui の Textarea を土台に、Input と同じ `error`（aria-invalid）と、
 * `maxLength` と組で使う文字数カウンタ（`showCount`）を載せたもの。
 * 見た目はテンプレートの `textarea.input-field` と同じ（tokens/components.css の `.cn-textarea`）。
 *
 * <important>
 * - カウンタは「残りが分かる」ためのもの。`maxLength` の強制はブラウザ（native）が行う。
 * - `error` は色だけを変える。必ずエラーメッセージも表示する（FormField を使えば両方付く）。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { Textarea as TextareaPrimitive } from "../ui/textarea";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  /** エラー状態。true にすると枠線が danger 色になる（aria-invalid） */
  error?: boolean;

  /**
   * 文字数カウンタ（「12 / 200」）を右下に出す。`maxLength` と組で使う。
   * @default false
   */
  showCount?: boolean;
}

/**
 * Textarea コンポーネント
 *
 * @example
 * ```tsx
 * <Textarea placeholder="申請の理由" rows={4} />
 *
 * // 文字数カウンタ付き
 * <Textarea maxLength={200} showCount />
 *
 * // FormField と組み合わせる
 * <FormField label="備考" helpText="200 文字まで">
 *   <Textarea maxLength={200} showCount />
 * </FormField>
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error = false,
      showCount = false,
      maxLength,
      value,
      defaultValue,
      onChange,
      className,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const invalid = ariaInvalid || error || undefined;
    const [uncontrolledLength, setUncontrolledLength] = React.useState(
      String(defaultValue ?? "").length,
    );
    const length = value !== undefined ? String(value).length : uncontrolledLength;

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) setUncontrolledLength(event.target.value.length);
      onChange?.(event);
    };

    const textarea = (
      <TextareaPrimitive
        ref={ref}
        aria-invalid={invalid}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(!showCount && className)}
        {...props}
      />
    );

    if (!showCount) return textarea;

    const over = maxLength !== undefined && length > maxLength;

    return (
      <div className={cn("cn-textarea-wrapper", className)}>
        {textarea}
        <span className="cn-textarea-count" data-over={over || undefined} aria-live="polite">
          {maxLength !== undefined ? `${length} / ${maxLength}` : `${length} 文字`}
        </span>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
