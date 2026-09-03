/**
 * FormField - ラベル + 入力 + エラー + ヘルプをまとめるフォーム部品
 *
 * shadcn/ui の Field 一式（Field / FieldLabel / FieldError / FieldDescription）を土台に、
 * id・aria-describedby・aria-invalid の結線を**自動で**行う。
 *
 * shadcn/ui の Field は compound で自由度が高い代わりに、この結線が利用者任せになる。
 * 画面ごとに書き忘れるとエラーが支援技術に伝わらないため、ここで面倒を見る。
 * 自由なレイアウトが必要な場合は Field を直接使ってよい。
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { joinDescribedBy } from "./native-validation";

export interface FormFieldProps {
  /** ラベル文字列 */
  label?: React.ReactNode;

  /** 必須マーク（*）を表示する */
  required?: boolean;

  /**
   * エラーメッセージ。渡すと赤字で表示され、入力欄と aria で紐づく。
   * 空文字・undefined のときは何も表示しない。
   */
  error?: string;

  /** 補足説明。エラーがあるときはエラーを優先し、ヘルプは下に残す */
  helpText?: React.ReactNode;

  /**
   * 入力欄。`<Input>` / `<Select>` / `<Textarea>` 等を渡す。
   * id / aria-describedby / aria-invalid は自動で注入される。
   */
  children: React.ReactElement;

  /**
   * 入力欄の id。省略時は自動生成する。
   * サーバー側のフォームと紐づける場合は `field.id_for_label` を渡す。
   */
  htmlFor?: string;

  /**
   * ラベルと入力欄の並び
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "responsive";

  className?: string;
}

/**
 * FormField コンポーネント
 *
 * @example
 * ```tsx
 * <FormField label="件名" required>
 *   <Input placeholder="例: 〇〇の改善について" />
 * </FormField>
 *
 * // エラー付き（error を渡すと子も自動で aria-invalid になり赤枠になる）
 * <FormField label="メールアドレス" error="形式が正しくありません">
 *   <Input defaultValue="foo@" />
 * </FormField>
 *
 * // ヘルプ付き
 * <FormField label="公開範囲" helpText="後から変更できます">
 *   <Select items={items} />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  required = false,
  error,
  helpText,
  children,
  htmlFor,
  orientation = "vertical",
  className,
}: FormFieldProps) {
  const autoId = React.useId();
  const id = htmlFor ?? (children.props as { id?: string }).id ?? autoId;

  const errorId = error ? `${id}-error` : undefined;
  const helpId = helpText ? `${id}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  /* 子要素へ注入するのは標準属性だけにする。
   *
   * shadcn/ui のエラー表現は「Field に data-invalid（見た目）＋ コントロールに
   * aria-invalid（支援技術）」の 2 本立てで、独自 prop を挟む余地は無い。
   * 以前はここで `error: true` も注入していたが、
   *   - 受け取らない子（Textarea / Checkbox / SearchInput /
   *     ButtonGroup）では DOM へ漏れ、React が毎レンダー
   *     「Received `true` for a non-boolean attribute」を出していた
   *   - 受け取る子でも aria-invalid と二重の経路になっていた
   * ため、aria-invalid へ一本化した。単体利用のための error prop は
   * 各コンポーネント側に残っている。 */
  const childProps = children.props as {
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  };
  const child = React.cloneElement(children, {
    id,
    /* cloneElement は undefined でもキーを上書きする。子が自分で持っている
     * aria-* を消さないよう合成する。 */
    "aria-describedby": joinDescribedBy(childProps["aria-describedby"], describedBy),
    "aria-invalid": error ? true : childProps["aria-invalid"],
  } as React.Attributes);

  return (
    <Field
      orientation={orientation}
      // Field 全体を error 表示へ切り替える shadcn/ui の入口
      // （tokens/components.css の .cn-field data-[invalid=true]）
      data-invalid={error ? true : undefined}
      className={cn("gap-1.5", className)}
    >
      {label && (
        <FieldLabel htmlFor={id}>
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="ml-0.5 text-danger">
                *
              </span>
              {/* 「*」だけでは支援技術に必須が伝わらないため文字でも伝える */}
              <span className="sr-only">（必須）</span>
            </>
          )}
        </FieldLabel>
      )}

      {child}

      {error && (
        <FieldError id={errorId} className="text-danger">
          {error}
        </FieldError>
      )}

      {helpText && <FieldDescription id={helpId}>{helpText}</FieldDescription>}
    </Field>
  );
}

FormField.displayName = "FormField";
