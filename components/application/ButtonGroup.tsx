/**
 * ButtonGroup - 共有 UI ライブラリのボタングループ（segmented control）
 *
 * 排他的な選択（どれか1つ）を、隣接したボタンの並びとして表現する。
 * 内部は shadcn/ui の ToggleGroup（単一選択モード）で、複数選択は表現できない。
 *
 * 縦並びのラジオボタンで見せたい場合は `RadioGroup` を使う。
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  NativeValidationMessage,
  joinDescribedBy,
  useNativeValidationRelay,
} from "./native-validation";

export interface ButtonGroupItem {
  /** 選択時の値 */
  value: string;
  /** 表示ラベル */
  label: string;
  /** ラベルの前に表示するアイコン */
  icon?: React.ReactNode;
  /** 選択不可にする */
  disabled?: boolean;
}

export interface ButtonGroupProps {
  /** 選択肢 */
  items: ButtonGroupItem[];

  /** 選択値（制御コンポーネントとして使う場合） */
  value?: string;

  /** 初期選択値（非制御の場合） */
  defaultValue?: string;

  /** 選択が変わったときに呼ばれる。選択が外れた場合は空文字を渡す。 */
  onValueChange?: (value: string) => void;

  /**
   * 見た目のバリアント
   * - primary: 選択中のボタンを primary 色の塗りで強調（既定）
   * - secondary: 選択中のボタンを控えめな塗りで示す
   */
  variant?: "primary" | "secondary";

  /** ボタンのサイズ */
  size?: "sm" | "md" | "lg";

  /** 操作不可にする */
  disabled?: boolean;

  /**
   * input の name（通常のフォーム送信に含める場合）。
   * ToggleGroup 自体はフォームコントロールではないため、hidden input で値を送る。
   */
  name?: string;

  /** 必須。name と併せてフォーム送信時の検証に使う */
  required?: boolean;

  className?: string;

  /**
   * ラベル文字列。
   *
   * <important>
   * 視覚的なラベルが画面上にない場合は `aria-label` か `aria-labelledby` が必須。
   * </important>
   */
  "aria-label"?: string;

  /** ラベルとなる要素の id（画面上にラベルがある場合はこちらを使う） */
  "aria-labelledby"?: string;

  /** 説明・エラー文言の id（FormField が自動で渡す） */
  "aria-describedby"?: string;

  /**
   * エラー状態（FormField が自動で渡す）。
   *
   * <important>
   * FormField は error が無いときも `aria-invalid: undefined` を
   * 渡してくる。rest spread に混ぜるとこちらが立てた値を消してしまうため、
   * 明示的に受け取って合成する。
   * </important>
   */
  "aria-invalid"?: boolean;
}

/** ButtonGroup のサイズ名 → shadcn/ui の toggle サイズ名 */
const SIZE_MAP = { sm: "sm", md: "default", lg: "lg" } as const;

/** variant 名 → toggle バリアント名（primary は components/ui/toggle.tsx の独自拡張） */
const VARIANT_MAP = { primary: "primary", secondary: "outline" } as const;

/**
 * ButtonGroup コンポーネント
 *
 * @example
 * ```tsx
 * const items = [
 *   { value: "day", label: "日" },
 *   { value: "week", label: "週" },
 *   { value: "month", label: "月" },
 * ]
 *
 * // 基本
 * <ButtonGroup items={items} defaultValue="day" aria-label="表示期間" />
 *
 * // 制御付き
 * <ButtonGroup items={items} value={period} onValueChange={setPeriod} aria-label="表示期間" />
 *
 * // アイコン付き
 * <ButtonGroup
 *   items={[
 *     { value: "list", label: "リスト", icon: <ListIcon /> },
 *     { value: "grid", label: "グリッド", icon: <GridIcon /> },
 *   ]}
 *   aria-label="表示形式"
 * />
 * ```
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      items,
      value,
      defaultValue,
      onValueChange,
      variant = "primary",
      size = "md",
      disabled = false,
      name,
      required,
      className,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...aria
    },
    ref,
  ) => {
    // Base UI の ToggleGroup は値を配列で扱う。
    // このコンポーネントは単一選択なので、境界で string <-> string[] を変換する。
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
    const current = value !== undefined ? value : uncontrolled;

    const groupRef = React.useRef<HTMLDivElement>(null);

    // 送信用 input は aria-hidden なので、ネイティブ検証が弾いたときの
    // フォーカスとエラー表示はボタン側へ引き受ける（native-validation.tsx）
    const nativeValidation = useNativeValidationRelay(() => {
      // roving tabindex なので、その時点で Tab が当たるボタンへ移す
      const group = groupRef.current;
      return (
        group?.querySelector<HTMLElement>('[data-slot="toggle-group-item"][tabindex="0"]') ??
        group?.querySelector<HTMLElement>('[data-slot="toggle-group-item"]') ??
        null
      );
    }, "選択してください");

    const invalid = nativeValidation.message !== null;

    /* 呼び出し側（FormField / FieldSet）が既にエラーを
     * 出しているときは、自前の文言を出さない。出すと同じ意味の赤い文言が 2 つ並び、
     * aria-describedby に両方の id が入って 2 回読まれる。
     * 判定は注入される aria-invalid で行う（error prop は注入しなくなったため）。 */
    const showNativeError = invalid && ariaInvalid !== true;

    const handleChange = React.useCallback(
      (next: string[]) => {
        const selected = next[0] ?? "";
        if (value === undefined) setUncontrolled(selected);
        onValueChange?.(selected);
        nativeValidation.clear();
      },
      [onValueChange, value, nativeValidation.clear],
    );

    return (
      <>
        <ToggleGroup
          ref={(node: HTMLDivElement | null) => {
            groupRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          aria-describedby={joinDescribedBy(
            ariaDescribedBy,
            showNativeError && nativeValidation.messageId,
          )}
          aria-invalid={ariaInvalid || invalid || undefined}
          value={value !== undefined ? (value === "" ? [] : [value]) : undefined}
          defaultValue={defaultValue !== undefined ? [defaultValue] : undefined}
          onValueChange={handleChange}
          disabled={disabled}
          variant={VARIANT_MAP[variant]}
          size={SIZE_MAP[size]}
          // spacing=0 で隣接ボタンが 1 本の枠に見える segmented control になる
          spacing={0}
          className={cn("inline-flex", className)}
          {...aria}
        >
          {items.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className="gap-1.5"
            >
              {item.icon}
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* ToggleGroup はフォームコントロールではないため、
            通常のフォーム送信に値を載せるには input が要る。
            両端の角丸は :first-child / :last-child で付くので、
            この input は ToggleGroup の中に置かない（最後の item が
            last-child でなくなり、右端の角丸が落ちる）。

            <important>
            type="hidden" にしてはいけない。hidden input は制約検証の対象外
            （barred from constraint validation）なので、required を付けても
            未選択のままフォームが valid になり、name="" が送信される。
            視覚的に隠した text input にすることで required が実際に効く。
            sr-only は position: absolute なのでレイアウトには影響しない。
            </important> */}
        {name && (
          <input
            type="text"
            name={name}
            value={current}
            required={required}
            disabled={disabled}
            // 値の変更はボタンの選択で行う。ここへ直接入力させない
            onChange={() => {}}
            onFocus={nativeValidation.onFocus}
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />
        )}

        {showNativeError && (
          <NativeValidationMessage id={nativeValidation.messageId}>
            {nativeValidation.message}
          </NativeValidationMessage>
        )}
      </>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";
