/**
 * Checkbox - 共有 UI ライブラリのチェックボックス
 *
 * ラベルとチェックボックスを紐づけた状態で提供する。
 * ラベルのクリックでもトグルできる（クリック領域が小さいと押しにくいため）。
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { Checkbox as CheckboxPrimitive } from "../ui/checkbox";
import { joinDescribedBy } from "./native-validation";

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive>, "children"> {
  /** ラベル。クリックでトグルできる */
  label?: React.ReactNode;

  /** ラベル下の補足説明 */
  description?: React.ReactNode;

  /** ラッパー要素に付けるクラス（チェックボックス本体は className） */
  wrapperClassName?: string;
}

/**
 * Checkbox コンポーネント
 *
 * @example
 * ```tsx
 * // 基本
 * <Checkbox label="利用規約に同意する" />
 *
 * // 制御付き
 * <Checkbox label="公開する" checked={open} onCheckedChange={setOpen} />
 *
 * // 説明付き
 * <Checkbox
 *   label="メール通知を受け取る"
 *   description="重要な更新のみ送信されます"
 * />
 *
 * // 全選択（一部選択状態）
 * <Checkbox label="すべて選択" indeterminate={someSelected} />
 * ```
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      label,
      description,
      className,
      wrapperClassName,
      id,
      /* 自前の description との紐付けを消さないよう、明示的に受け取って合成する。
       * FormField は常に aria-describedby を注入してくるため、
       * {...props} でそのまま上書きさせると description が読まれなくなる。 */
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const descId = description ? `${inputId}-desc` : undefined;

    const describedBy = joinDescribedBy(ariaDescribedBy, descId);

    if (!label && !description) {
      return (
        <CheckboxPrimitive
          ref={ref}
          id={inputId}
          aria-describedby={describedBy}
          className={className}
          {...props}
        />
      );
    }

    return (
      <div className={cn("flex items-start gap-2", wrapperClassName)}>
        <CheckboxPrimitive
          ref={ref}
          id={inputId}
          aria-describedby={describedBy}
          // ラベル1行目と視覚的に揃える
          className={cn("mt-0.5", className)}
          {...props}
        />
        <div className="min-w-0">
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "block cursor-pointer text-sm text-foreground",
                props.disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descId} className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
