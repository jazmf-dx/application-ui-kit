/**
 * FieldSet - グループで選ぶ入力にラベル・エラー・ヘルプを付ける
 *
 * ラジオグループ・ボタングループのように「単一のフォームコントロールが無い」入力用。
 *
 * <important>
 * `<label for>` は labelable 要素（button / input / select / textarea / meter /
 * output / progress）にしか効かない。`<div role="radiogroup">` や
 * `<div role="group">` を指しても**ブラウザは黙って無視する**ため、
 * FormField（label + htmlFor）をグループへ使うと
 * 「ラベルはあるのにアクセシブル名が無い」状態になる。
 *
 * shadcn/ui もグループには FieldLabel + htmlFor を使わず FieldSet + FieldLegend を
 * 使う。この部品はその形を作り、名前は `aria-labelledby` で結ぶ。
 * </important>
 *
 * 単一のコントロールを持つ入力（Input / Select / Combobox / DatePicker …）は
 * `FormField` を使う。
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import {
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet as FieldSetPrimitive,
} from "../ui/field";
import { joinDescribedBy } from "./native-validation";

export interface FieldSetProps {
  /** グループのラベル */
  label?: React.ReactNode;

  /** 必須マーク（*）を表示する */
  required?: boolean;

  /**
   * エラーメッセージ。渡すと赤字で表示され、グループと aria で紐づく。
   * 空文字・undefined のときは何も表示しない。
   */
  error?: string;

  /** 補足説明。エラーがあるときはエラーを優先し、ヘルプは下に残す */
  helpText?: React.ReactNode;

  /**
   * グループ本体。`aria-labelledby` / `aria-describedby` / `aria-invalid` を
   * 自動で注入する。
   */
  children: React.ReactElement;

  className?: string;
}

/**
 * FieldSet コンポーネント
 *
 * @example
 * ```tsx
 * <FieldSet label="優先度" required helpText="後から変更できます">
 *   <RadioGroup items={PRIORITIES} name="priority" />
 * </FieldSet>
 *
 * // エラー付き
 * <FieldSet label="表示期間" error="表示期間を選択してください">
 *   <ButtonGroup items={PERIODS} name="period" />
 * </FieldSet>
 * ```
 */
export function FieldSet({
  label,
  required = false,
  error,
  helpText,
  children,
  className,
}: FieldSetProps) {
  const autoId = React.useId();

  const legendId = label ? `${autoId}-legend` : undefined;
  const errorId = error ? `${autoId}-error` : undefined;
  const helpId = helpText ? `${autoId}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  /* グループには id / htmlFor ではなく aria-labelledby で名前を与える。
   * <legend> は fieldset の名前にはなるが、中の role="radiogroup" には届かない。
   *
   * <important>
   * cloneElement は undefined でもキーを上書きする。子が自分で持っている
   * aria-* を消さないよう、必ず合成する（上書きすると、子側で管理している
   * エラー状態や説明の紐付けが黙って消える）。
   * </important> */
  const childProps = children.props as {
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  };
  const child = React.cloneElement(children, {
    "aria-labelledby": legendId ?? childProps["aria-labelledby"],
    "aria-describedby": joinDescribedBy(childProps["aria-describedby"], describedBy),
    "aria-invalid": error ? true : childProps["aria-invalid"],
  } as React.Attributes);

  return (
    <FieldSetPrimitive
      // FormField と同じく、error 時は全体を error 表示へ切り替える
      data-invalid={error ? true : undefined}
      className={cn("gap-1.5", className)}
    >
      {label && (
        <FieldLegend id={legendId} variant="label">
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
        </FieldLegend>
      )}

      {child}

      {error && <FieldError id={errorId}>{error}</FieldError>}

      {helpText && <FieldDescription id={helpId}>{helpText}</FieldDescription>}
    </FieldSetPrimitive>
  );
}

FieldSet.displayName = "FieldSet";
