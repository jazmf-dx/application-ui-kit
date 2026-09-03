/**
 * RadioGroup - 共有 UI ライブラリのラジオボタングループ（排他選択）
 *
 * 排他的な選択（どれか1つ）を、フォームの選択肢として表示する。
 * 見せ方は `variant` で選ぶ。
 *
 *   list  … ドット + ラベルの素の並び。既定。項目が短く、比較の必要が薄いとき
 *   cards … 枠付きカードの並び。説明や右端の補足（金額・容量）を見比べて選ぶとき
 *
 * 隣接ボタンが1本の枠に見える見た目が欲しい場合は `ButtonGroup` を使う。
 * 列で比較させたい（複数の属性を並べて見せたい）場合は `RadioTable` を使う。
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import {
  RadioGroupItem as RadioGroupItemPrimitive,
  RadioGroup as RadioGroupPrimitive,
} from "../ui/radio-group";

export type RadioGroupVariant = "list" | "cards";

export interface RadioGroupItem {
  /** 選択時の値 */
  value: string;
  /** 表示ラベル */
  label: React.ReactNode;
  /** ラベル下の補足説明 */
  description?: React.ReactNode;
  /** 行の右端に置く補足（金額・容量など）。`variant="cards"` で使う */
  meta?: React.ReactNode;
  /** 選択不可にする */
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** 選択肢 */
  items: RadioGroupItem[];

  /** 選択値（制御コンポーネントとして使う場合） */
  value?: string;

  /** 初期選択値（非制御の場合） */
  defaultValue?: string;

  /** 選択が変わったときに呼ばれる */
  onValueChange?: (value: string) => void;

  /**
   * 見せ方
   * @default "list"
   */
  variant?: RadioGroupVariant;

  /**
   * 選択肢の並び方向
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";

  /** 操作不可にする */
  disabled?: boolean;

  /** 必須 */
  required?: boolean;

  /** input の name（通常のフォーム送信に含める場合） */
  name?: string;

  /**
   * グループのラベルとなる要素の id。
   *
   * <important>
   * グループには `<label for>` が効かない（labelable 要素ではない）。
   * ラベルを付けるときは FieldSet を使うか、この prop を渡す。
   * </important>
   */
  "aria-labelledby"?: string;

  /** 説明・エラー文言の id */
  "aria-describedby"?: string;

  /** エラー状態 */
  "aria-invalid"?: boolean;

  className?: string;
}

const LAYOUT_CLASS = {
  list: {
    vertical: "flex-col gap-2.5",
    horizontal: "flex-row flex-wrap gap-4",
  },
  cards: {
    vertical: "flex-col gap-3",
    // カードは潰れると説明が読めないので最低幅（12rem）を持たせ、入らない分は
    // 折り返す。flex-wrap ではなく grid にするのは、折り返した最後の1枚だけが
    // 横幅いっぱいに伸びて他と比較しにくくなるのを避けるため。
    horizontal: "grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3",
  },
} as const;

/**
 * カード枠の見た目。
 *
 * 選択状態は Base UI が併せて描画する hidden な `<input type="radio">` を見る
 * （role="radio" の span の data-checked ではなく `:checked`）。has-checked は
 * 素の CSS の状態選択なので、非制御でも制御でも同じように効く。
 */
const CARD_CLASS = cn(
  "flex cursor-pointer items-start gap-3 rounded-lg border border-input bg-background p-4",
  "transition-colors hover:bg-accent/40",
  "has-checked:border-primary has-checked:ring-1 has-checked:ring-primary",
  "has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2",
  "has-disabled:cursor-not-allowed has-disabled:opacity-60 has-disabled:hover:bg-background",
);

/**
 * RadioGroup コンポーネント
 *
 * @example
 * ```tsx
 * const items = [
 *   { value: "high", label: "高" },
 *   { value: "mid",  label: "中" },
 *   { value: "low",  label: "低" },
 * ]
 *
 * // 基本
 * <RadioGroup items={items} defaultValue="mid" />
 *
 * // 制御付き
 * <RadioGroup items={items} value={v} onValueChange={setV} />
 *
 * // 横並び
 * <RadioGroup items={items} orientation="horizontal" />
 *
 * // カード（説明・右端の補足を見比べて選ばせる）
 * <RadioGroup
 *   variant="cards"
 *   items={[
 *     { value: "standard", label: "通常配送", description: "3〜5営業日", meta: "無料" },
 *     { value: "express",  label: "速達",     description: "翌営業日",   meta: "550円" },
 *   ]}
 *   defaultValue="standard"
 * />
 * ```
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      items,
      value,
      defaultValue,
      onValueChange,
      variant = "list",
      orientation = "vertical",
      disabled = false,
      required,
      name,
      className,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
    },
    ref,
  ) => {
    const reactId = React.useId();
    /* name があってもインスタンスごとの id を混ぜる。name だけで組むと、
     * 同じ name の同じ行を持つフォームが 2 つ（別ダイアログ等）同時に載ったとき
     * id が衝突し、label の htmlFor が先勝ちで別インスタンスを指す。 */
    const idBase = `application-radio-${reactId}`;

    return (
      <RadioGroupPrimitive
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange as (v: unknown) => void}
        disabled={disabled}
        required={required}
        name={name}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={cn("flex", LAYOUT_CLASS[variant][orientation], className)}
      >
        {items.map((item) => {
          const autoId = `${idBase}-${item.value}`;
          const descId = item.description ? `${autoId}-desc` : undefined;

          // cards はカード全体をクリック領域にするため <label> で包む。
          // list はラベルだけを htmlFor で紐づける（クリック領域は文字とドット）。
          // どちらも Base UI が hidden input と label を id で結ぶので、
          // ラベルクリックでの選択と読み上げ名の両方が付く。
          if (variant === "cards") {
            // カード全体が <label> なので、明示しないと読み上げ名に
            // 説明も meta も混ざる（「速達翌営業日550円」と読まれる）。
            // 名前はタイトルだけに絞り、説明は aria-describedby に回す。
            const titleId = `${autoId}-title`;
            return (
              <label key={item.value} htmlFor={autoId} className={CARD_CLASS}>
                <RadioGroupItemPrimitive
                  id={autoId}
                  value={item.value}
                  disabled={item.disabled}
                  aria-labelledby={titleId}
                  aria-describedby={descId}
                  className="mt-0.5"
                />
                <span className="min-w-0 flex-1">
                  <span id={titleId} className="block text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  {item.description && (
                    <span id={descId} className="mt-0.5 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </span>
                {item.meta && (
                  <span className="shrink-0 text-sm text-muted-foreground">{item.meta}</span>
                )}
              </label>
            );
          }

          return (
            <div key={item.value} className="flex items-start gap-2">
              <RadioGroupItemPrimitive
                id={autoId}
                value={item.value}
                disabled={item.disabled}
                aria-describedby={descId}
                className="mt-0.5"
              />
              <div className="min-w-0">
                <label
                  htmlFor={autoId}
                  className={cn(
                    "block cursor-pointer text-sm text-foreground",
                    item.disabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  {item.label}
                </label>
                {item.description && (
                  <p id={descId} className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.meta && <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>}
              </div>
            </div>
          );
        })}
      </RadioGroupPrimitive>
    );
  },
);

RadioGroup.displayName = "RadioGroup";
