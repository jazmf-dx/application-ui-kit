/**
 * Input - 共有 UI ライブラリのテキスト入力コンポーネント
 *
 * 見た目は CSS クラスの `input-field` に揃えている（tokens/components.css の `.cn-input`）。
 * 同じ画面にサーバーレンダリングのフォームと React コンポーネントが並んでも段差が出ないようにするため。
 *
 * 画面側では Input のみを使用し、素の <input> にクラスを直書きしないでください。
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { Input as InputPrimitive } from "../ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";

export interface InputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "size"> {
  /**
   * エラー状態。true にすると枠線が danger 色になる。
   *
   * <important>
   * 色だけでエラーを表現してはいけない（色覚特性のある利用者に伝わらない）。
   * 必ずエラーメッセージも表示する。FormField を使えば自動で両方付く。
   * </important>
   */
  error?: boolean;

  /** 入力欄の前に表示するアイコン（検索アイコン等） */
  leftIcon?: React.ReactNode;

  /** 入力欄の後ろに表示するアイコン・ボタン（クリアボタン等） */
  rightIcon?: React.ReactNode;
}

/**
 * Input コンポーネント
 *
 * @example
 * ```tsx
 * // 基本
 * <Input placeholder="タイトルを入力" />
 *
 * // エラー状態（メッセージは別途表示すること）
 * <Input error defaultValue="不正な値" />
 *
 * // アイコン付き
 * <Input leftIcon={<SearchIcon />} placeholder="検索" />
 *
 * // ラベル・エラー・ヘルプをまとめる場合は FormField を使う
 * <FormField label="件名" required error="件名は必須です">
 *   <Input />
 * </FormField>
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error = false,
      leftIcon,
      rightIcon,
      type = "text",
      /* FormField は error が無いときも aria-invalid: undefined を
       * 渡してくる。rest spread に混ぜるとこちらが立てた値を消すため、
       * 明示的に受け取って合成する（ButtonGroup と同じ理由）。 */
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    // エラーは aria-invalid で表現する。見た目は .cn-input の aria-invalid: が拾う。
    // 色と支援技術への伝達を 1 つの属性に束ねられるため、独自クラスは足さない。
    const invalid = ariaInvalid || error || undefined;

    // アイコンがなければ余計な wrapper を作らない（レイアウトへの影響を避ける）
    if (!leftIcon && !rightIcon) {
      return (
        <InputPrimitive
          ref={ref}
          type={type}
          aria-invalid={invalid}
          className={className}
          {...props}
        />
      );
    }

    return (
      <InputGroup className={cn(error && "border-danger", className)}>
        {leftIcon && (
          <InputGroupAddon align="inline-start" aria-hidden="true">
            {leftIcon}
          </InputGroupAddon>
        )}
        <InputGroupInput ref={ref} type={type} aria-invalid={invalid} {...props} />
        {rightIcon && <InputGroupAddon align="inline-end">{rightIcon}</InputGroupAddon>}
      </InputGroup>
    );
  },
);

Input.displayName = "Input";
