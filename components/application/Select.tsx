/**
 * Select - 共有 UI ライブラリのセレクトボックス
 *
 * 見た目は CSS クラスの `select.input-field` に揃えている。
 *
 * <important>
 * 選択肢が多く検索が必要な場合（部署選択・社員選択など）は Select を使わない。
 * React 側は Combobox、テンプレート側はネイティブの `<select>` を使う。
 * Select は選択肢が十数個までの用途に限る。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import {
  SelectContent,
  SelectGroup,
  SelectItem as SelectItemPrimitive,
  SelectLabel,
  Select as SelectPrimitive,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface SelectItem {
  /** 選択時の値 */
  value: string;
  /** 表示ラベル */
  label: string;
  /** 選択不可にする */
  disabled?: boolean;
  /** グループ見出し（同じ文字列が続く項目がまとめられる） */
  group?: string;
}

export interface SelectProps {
  /** 選択肢 */
  items: SelectItem[];

  /** 選択値（制御コンポーネントとして使う場合） */
  value?: string | null;

  /** 初期選択値（非制御の場合） */
  defaultValue?: string | null;

  /** 選択が変わったときに呼ばれる */
  onValueChange?: (value: string) => void;

  /** 未選択時に表示する文字列 */
  placeholder?: string;

  /** 操作不可にする */
  disabled?: boolean;

  /**
   * エラー状態。枠線が danger 色になる。
   * 色だけに頼らずエラーメッセージも表示すること（FormField が自動で行う）。
   */
  error?: boolean;

  /** input の name（通常のフォーム送信に含める場合） */
  name?: string;

  /** 必須 */
  required?: boolean;

  id?: string;
  className?: string;

  /**
   * ラベル文字列。
   *
   * <important>
   * トリガーは `role="combobox"` になる。ARIA はこのロールに
   * 「中身の文字列を名前として使う」ことを認めていないため、
   * 選択中の値や placeholder があってもアクセシブルな名前にならない。
   * `FormField` で囲まない場合は `aria-label` か `aria-labelledby` が必須。
   * </important>
   */
  "aria-label"?: string;

  /** ラベルとなる要素の id（画面上にラベルがある場合はこちらを使う） */
  "aria-labelledby"?: string;

  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

/**
 * Select コンポーネント
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
 * <Select items={items} placeholder="優先度を選択" />
 *
 * // 制御付き
 * <Select items={items} value={v} onValueChange={setV} />
 *
 * // グループ分け
 * <Select items={[
 *   { value: "a", label: "営業部", group: "本社" },
 *   { value: "b", label: "製造部", group: "工場" },
 * ]} />
 * ```
 */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      items,
      value,
      defaultValue,
      onValueChange,
      placeholder = "選択してください",
      disabled = false,
      error = false,
      name,
      required,
      id,
      className,
      /* FormField は error が無いときも aria-invalid: undefined を
       * 渡してくる。rest spread に混ぜるとこちらが立てた値を消すため、
       * 明示的に受け取って合成する（ButtonGroup と同じ理由）。 */
      "aria-invalid": ariaInvalid,
      ...aria
    },
    ref,
  ) => {
    // group が付いている項目をまとめる。順序は items の出現順を保つ。
    const groups = React.useMemo(() => {
      const out: Array<{ name: string | undefined; items: SelectItem[] }> = [];
      for (const item of items) {
        const last = out[out.length - 1];
        if (last && last.name === item.group) last.items.push(item);
        else out.push({ name: item.group, items: [item] });
      }
      return out;
    }, [items]);

    // Base UI は値 → ラベルの対応を Root の items から引く。
    // 渡さないとトリガーに value がそのまま出る（"mid" のように内部値が見えてしまう）。
    const valueLabels = React.useMemo(
      () => items.map(({ value: v, label }) => ({ value: v, label })),
      [items],
    );

    return (
      <SelectPrimitive
        items={valueLabels}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange as (v: unknown) => void}
        disabled={disabled}
        name={name}
        required={required}
      >
        <SelectTrigger
          ref={ref}
          id={id}
          /* error の見た目は className ではなく aria-invalid から出す
           * （.cn-select-trigger の aria-invalid:border-danger）。
           * 支援技術にも同時に伝わり、状態の経路が 1 本になる。 */
          aria-invalid={ariaInvalid || error || undefined}
          className={className}
          {...aria}
        >
          <SelectValue placeholder={<span className="text-muted-foreground">{placeholder}</span>} />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group, gi) =>
            group.name ? (
              <SelectGroup key={`${group.name}-${gi}`}>
                <SelectLabel>{group.name}</SelectLabel>
                {group.items.map((item) => (
                  <SelectItemPrimitive key={item.value} value={item.value} disabled={item.disabled}>
                    {item.label}
                  </SelectItemPrimitive>
                ))}
              </SelectGroup>
            ) : (
              group.items.map((item) => (
                <SelectItemPrimitive key={item.value} value={item.value} disabled={item.disabled}>
                  {item.label}
                </SelectItemPrimitive>
              ))
            ),
          )}
        </SelectContent>
      </SelectPrimitive>
    );
  },
);

Select.displayName = "Select";
