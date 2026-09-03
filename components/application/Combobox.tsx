/**
 * Combobox - 検索と新規作成ができるセレクト
 *
 * 見た目は Select（= テンプレートの `select.input-field`）に揃えている。
 *
 * <important>
 * 選択肢が十数個までで検索が要らない場合は Select を使う。
 * Combobox は「入力して絞り込む」ことに意味がある規模の選択肢
 * （タグ、担当者、店舗など）と、一覧に無いものをその場で作る用途のためにある。
 * </important>
 */

import * as React from "react";
import {
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem as ComboboxItemPrimitive,
  ComboboxList,
  Combobox as ComboboxPrimitive,
  ComboboxValue,
} from "../ui/combobox";

/**
 * 新規作成された値に付く接頭辞。
 *
 * `creatable` で「"○○" を新規作成」を選ぶと、選択値は
 * `__create__:○○` の形で入る。既存の選択肢と区別するために付けている。
 * 呼び出し側は splitCreatedValues() で分けること。
 */
export const COMBOBOX_CREATE_PREFIX = "__create__:";

/**
 * 選択値を「既存の value」と「新規作成された名前」に分ける。
 *
 * @example
 * ```ts
 * splitCreatedValues(["12", "__create__:新しいタグ"])
 * // => { values: ["12"], created: ["新しいタグ"] }
 * ```
 */
export function splitCreatedValues(values: readonly string[]): {
  values: string[];
  created: string[];
} {
  const existing: string[] = [];
  const created: string[] = [];
  for (const value of values) {
    if (value.startsWith(COMBOBOX_CREATE_PREFIX)) {
      created.push(value.slice(COMBOBOX_CREATE_PREFIX.length));
    } else {
      existing.push(value);
    }
  }
  return { values: existing, created };
}

export interface ComboboxItem {
  /** 選択時の値 */
  value: string;
  /** 表示ラベル。絞り込みはこの文字列に対して行う */
  label: string;
  /**
   * ラベルの右に小さく出す補足（件数、コード等）。
   * 絞り込みの対象にはならず、チップにも出ない。
   */
  badge?: string;
  /** 選択不可にする */
  disabled?: boolean;
}

export interface ComboboxProps {
  /** 選択肢 */
  items: ComboboxItem[];

  /**
   * 複数選択にする。選択済みはチップで表示される。
   * @default false
   */
  multiple?: boolean;

  /** 選択値（制御コンポーネントとして使う場合）。`multiple` のときは配列 */
  value?: string | string[] | null;

  /** 初期選択値（非制御の場合） */
  defaultValue?: string | string[] | null;

  /** 選択が変わったときに呼ばれる */
  onValueChange?: (value: string | string[] | null) => void;

  /**
   * 入力した文字列が選択肢に無いとき、「"○○" を新規作成」を出す。
   * 選ぶと `__create__:○○` が選択値に入る（COMBOBOX_CREATE_PREFIX）。
   * @default false
   */
  creatable?: boolean;

  /** 新規作成が選ばれたときに呼ばれる。引数は入力された文字列 */
  onCreate?: (label: string) => void;

  /** 新規作成の項目に出す文言 */
  formatCreateLabel?: (query: string) => React.ReactNode;

  /** 未選択時に入力欄へ出す文字列 */
  placeholder?: string;

  /** 該当が無いときにドロップダウンへ出す文字列 */
  emptyMessage?: string;

  /**
   * 選択を消すボタンを出す。
   * @default false
   */
  clearable?: boolean;

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
   * 入力欄は `role="combobox"` になる。ARIA はこのロールに
   * 「中身の文字列を名前として使う」ことを認めていないため、placeholder があっても
   * アクセシブルな名前にならない。`FormField` で囲まない場合は
   * `aria-label` か `aria-labelledby` が必須。
   * </important>
   */
  "aria-label"?: string;

  /** ラベルとなる要素の id（画面上にラベルがある場合はこちらを使う） */
  "aria-labelledby"?: string;

  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

const toArray = (value: string | string[] | null | undefined): string[] => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

/**
 * Combobox コンポーネント
 *
 * @example
 * ```tsx
 * const items = [
 *   { value: "1", label: "渋谷店", badge: "12" },
 *   { value: "2", label: "新宿店", badge: "8" },
 * ]
 *
 * // 単一選択
 * <Combobox items={items} aria-label="店舗" />
 *
 * // 複数選択 + 新規作成
 * <Combobox
 *   items={tags}
 *   multiple
 *   creatable
 *   value={value}
 *   onValueChange={(v) => setValue(v as string[])}
 *   aria-label="タグ"
 * />
 * ```
 */
export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      items,
      multiple = false,
      value,
      defaultValue,
      onValueChange,
      creatable = false,
      onCreate,
      formatCreateLabel,
      placeholder = "選択してください",
      emptyMessage = "該当する選択肢がありません",
      clearable = false,
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
    const [query, setQuery] = React.useState("");

    const labels = React.useMemo(() => {
      const map = new Map<string, string>();
      for (const item of items) {
        map.set(item.value, item.label);
      }
      return map;
    }, [items]);

    const labelOf = React.useCallback(
      (itemValue: string) => {
        const known = labels.get(itemValue);
        if (known !== undefined) return known;
        if (itemValue.startsWith(COMBOBOX_CREATE_PREFIX)) {
          return itemValue.slice(COMBOBOX_CREATE_PREFIX.length);
        }
        return itemValue;
      },
      [labels],
    );

    const badges = React.useMemo(() => {
      const map = new Map<string, string>();
      for (const item of items) {
        if (item.badge !== undefined) map.set(item.value, item.badge);
      }
      return map;
    }, [items]);

    const disabledValues = React.useMemo(() => {
      const set = new Set<string>();
      for (const item of items) {
        if (item.disabled) set.add(item.value);
      }
      return set;
    }, [items]);

    // 入力した文字列が既存のラベルと一致しないときだけ、新規作成の項目を出す。
    const trimmedQuery = query.trim();
    const createValue = React.useMemo(() => {
      if (!creatable || trimmedQuery === "") return null;
      const exists = items.some(
        (item) =>
          item.label.localeCompare(trimmedQuery, undefined, { sensitivity: "accent" }) === 0,
      );
      if (exists) return null;
      return `${COMBOBOX_CREATE_PREFIX}${trimmedQuery}`;
    }, [creatable, items, trimmedQuery]);

    // 新規作成で選ばれた値は items に無いため、選択済みのものを足しておく。
    // Root が選択値のラベルを解決できるようにするため。
    // selectedKey は value / defaultValue の内容キー。この配列の identity が変わると
    // Base UI が入力値を選択値のラベルへ戻すため、中身が同じなら同じ配列を返し続ける
    // 必要がある（呼び出し側が毎回新しい配列を渡しても入力が消えないように）。
    const selectedKey = toArray(value ?? defaultValue).join("\n");
    const itemValues = React.useMemo(() => {
      const values = items.map((item) => item.value);
      for (const selected of selectedKey === "" ? [] : selectedKey.split("\n")) {
        if (!labels.has(selected)) values.push(selected);
      }
      return values;
    }, [items, selectedKey, labels]);

    const handleValueChange = React.useCallback(
      (next: string | string[] | null) => {
        if (onCreate) {
          for (const candidate of toArray(next)) {
            if (candidate.startsWith(COMBOBOX_CREATE_PREFIX)) {
              const created = candidate.slice(COMBOBOX_CREATE_PREFIX.length);
              if (!toArray(value).includes(candidate)) onCreate(created);
            }
          }
        }
        onValueChange?.(next);
      },
      [onCreate, onValueChange, value],
    );

    const renderItem = (itemValue: string) => {
      const badge = badges.get(itemValue);
      return (
        <ComboboxItemPrimitive
          key={itemValue}
          value={itemValue}
          disabled={disabledValues.has(itemValue)}
        >
          <span className="flex w-full items-center justify-between gap-4">
            <span className="truncate">{labelOf(itemValue)}</span>
            {badge !== undefined && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {badge}
              </span>
            )}
          </span>
        </ComboboxItemPrimitive>
      );
    };

    return (
      <ComboboxPrimitive<string, boolean>
        items={itemValues}
        multiple={multiple}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        onInputValueChange={setQuery}
        itemToStringLabel={labelOf}
        disabled={disabled}
        name={name}
        required={required}
      >
        {multiple ? (
          // エラー枠は内側の input の aria-invalid を .cn-combobox-chips が has- で拾う。
          // 以前ここにあった data-invalid は対応するセレクタが無く効いていなかった。
          <ComboboxChips className={className}>
            <ComboboxValue>
              {(selected: string[]) =>
                selected.map((selectedValue) => (
                  // 削除ボタンは ComboboxChip が内包する（showRemove の既定は true）。
                  // removeLabel を渡さないと「ボタン」としか読まれないため必ず渡す。
                  <ComboboxChip
                    key={selectedValue}
                    removeLabel={`${labelOf(selectedValue)} を外す`}
                  >
                    {labelOf(selectedValue)}
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              ref={ref}
              id={id}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={ariaInvalid || error || undefined}
              {...aria}
            />
          </ComboboxChips>
        ) : (
          // gen3 の ComboboxInput は入力欄・開閉トリガー・クリアボタンを内包する
          <ComboboxInput
            ref={ref}
            id={id}
            placeholder={placeholder}
            disabled={disabled}
            showClear={clearable}
            aria-invalid={ariaInvalid || error || undefined}
            className={className}
            {...aria}
          />
        )}
        <ComboboxContent>
          {/* 新規作成は Root の items に混ぜない。items の identity が変わると
              Base UI が入力値を選択値のラベルへ戻してしまい、1文字打つたびに
              入力が消えるため。絞り込みの対象外なので常に最後に出る。 */}
          <ComboboxEmpty>{createValue === null ? emptyMessage : null}</ComboboxEmpty>
          <ComboboxList>{(itemValue: string) => renderItem(itemValue)}</ComboboxList>
          {createValue !== null && (
            <ComboboxItemPrimitive value={createValue}>
              <span className="truncate">
                {formatCreateLabel
                  ? formatCreateLabel(trimmedQuery)
                  : `「${trimmedQuery}」を新規作成`}
              </span>
            </ComboboxItemPrimitive>
          )}
        </ComboboxContent>
      </ComboboxPrimitive>
    );
  },
);

Combobox.displayName = "Combobox";
