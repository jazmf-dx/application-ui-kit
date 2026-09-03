/**
 * TreeSelect - 階層構造から 1 つ選ぶカスケードセレクト
 *
 * 親をホバー / フォーカスすると子階層が右隣の列に開く（macOS のメニューと同じ挙動）。
 * ツリーは `items` で丸ごと受け取り、コンポーネント自身はデータ取得を行わない。
 *
 * <important>
 * これは階層そのものを見せて選ばせるための汎用部品であり、業務ドメインを持たない。
 * 部署・組織・拠点のように「どのマスタから取るか」がある選択は、
 * ドメインを所有するプロジェクト側がこのコンポーネントへ `items` を渡して組み立てる。
 * マスタの取得・認証・CSRF・エンドポイントをここへ焼き込まないこと
 * （Application UI Standard §6 Domain Components）。
 * </important>
 *
 * <important>
 * 階層をたどらせる必然性が無いなら使わない。
 * 選択肢が十数個までなら Select、
 * 件数が多く「検索して 1 つ選ぶ」なら Combobox を使う。
 * TreeSelect は、選んだ結果より **どこに属するか** を見せたい場合のためにある。
 * </important>
 */

import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  NativeValidationMessage,
  joinDescribedBy,
  useNativeValidationRelay,
} from "./native-validation";

/** 横に展開する最大階層数の既定値 */
const DEFAULT_MAX_LEVELS = 4;

export interface TreeSelectItem {
  /** 選択時の値。ツリー全体で一意にすること */
  value: string;
  /** 表示ラベル */
  label: string;
  /**
   * ラベルの右に小さく出す補足（部署長名、コード、件数等）。
   * 選択後のトリガー表示には出ない。
   */
  badge?: string;
  /** 選択不可にする。子を持つ場合、展開は引き続きできる */
  disabled?: boolean;
  /** 子階層。空配列と未指定はどちらも「子なし」として扱う */
  children?: TreeSelectItem[];
}

export interface TreeSelectProps {
  /** 階層ツリー。ルート階層を配列で渡す */
  items: TreeSelectItem[];

  /** 選択値（制御コンポーネントとして使う場合） */
  value?: string | null;

  /** 初期選択値（非制御の場合） */
  defaultValue?: string | null;

  /** 選択が変わったときに呼ばれる */
  onValueChange?: (value: string) => void;

  /** 未選択時に表示する文字列 */
  placeholder?: string;

  /**
   * 子を持つ項目（中間ノード）を選択不可にする。
   * 末端だけが意味を持つマスタで使う。
   * @default false
   */
  leafOnly?: boolean;

  /**
   * 選択中の項目をルートからの経路で表示する（例: `情報システム部 / 基幹システム課`）。
   * false のときは末端のラベルだけを出す。
   * @default true
   */
  showPath?: boolean;

  /**
   * 横に展開する最大階層数。これより深い階層は開かない。
   * @default 4
   */
  maxLevels?: number;

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
  "aria-labelledby"?: string;

  /** FormField がエラー・補足説明を紐づけるために注入する */
  "aria-describedby"?: string;

  /** エラー状態（FormField / FieldSet が自動で渡す） */
  "aria-invalid"?: boolean;
}

/** ルートから value までの経路を返す。見つからなければ null */
export function findTreePath(items: TreeSelectItem[], value: string): TreeSelectItem[] | null {
  for (const node of items) {
    if (node.value === value) return [node];
    const found = node.children?.length ? findTreePath(node.children, value) : null;
    if (found) return [node, ...found];
  }
  return null;
}

/** activePath に沿って depth 階層目に並べる項目を取り出す */
function levelItems(
  items: TreeSelectItem[],
  activePath: number[],
  depth: number,
): TreeSelectItem[] {
  let current = items;
  for (let i = 0; i < depth; i++) {
    const index = activePath[i];
    if (index === undefined || !current[index]) return [];
    current = current[index].children ?? [];
  }
  return current;
}

/**
 * TreeSelect コンポーネント
 *
 * @example
 * ```tsx
 * const UNITS: TreeSelectItem[] = [
 *   {
 *     value: "hq",
 *     label: "本社",
 *     children: [
 *       { value: "sales", label: "営業部" },
 *       { value: "it", label: "情報システム部", badge: "鈴木" },
 *     ],
 *   },
 * ];
 *
 * const [unit, setUnit] = useState<string | null>(null);
 * <TreeSelect items={UNITS} value={unit} onValueChange={setUnit} aria-label="組織" />
 * ```
 */
export function TreeSelect({
  items,
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "選択してください",
  leafOnly = false,
  showPath = true,
  maxLevels = DEFAULT_MAX_LEVELS,
  disabled = false,
  error = false,
  name,
  required = false,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: TreeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [activePath, setActivePath] = React.useState<number[]>([]);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // 送信用 input は aria-hidden なので、ネイティブ検証が弾いたときの
  // フォーカスとエラー表示はトリガー側へ引き受ける（native-validation.tsx）
  const nativeValidation = useNativeValidationRelay(() => triggerRef.current, "選択してください");

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | null>(defaultValue);
  const selectedValue = isControlled ? value : internalValue;

  const selectedPath = React.useMemo(
    () => (selectedValue ? findTreePath(items, selectedValue) : null),
    [items, selectedValue],
  );

  /** 選択済みノードまでの経路を、各階層での index 配列に直したもの */
  const selectedIndices = React.useMemo(() => {
    if (!selectedPath) return [];
    const indices: number[] = [];
    let current = items;
    for (const node of selectedPath) {
      const index = current.findIndex((n) => n.value === node.value);
      if (index < 0) break;
      indices.push(index);
      current = current[index].children ?? [];
    }
    return indices;
  }, [selectedPath, items]);

  // 開いた瞬間は選択済みの階層を開いた状態にして、いまどこにいるかを見せる
  React.useEffect(() => {
    if (open) setActivePath(selectedIndices);
  }, [open, selectedIndices]);

  const columns = React.useMemo(() => {
    const result: TreeSelectItem[][] = [];
    for (let depth = 0; depth < maxLevels; depth++) {
      const level = levelItems(items, activePath, depth);
      if (!level.length) break;
      result.push(level);
    }
    return result;
  }, [items, activePath, maxLevels]);

  const label = selectedPath
    ? showPath
      ? selectedPath.map((n) => n.label).join(" / ")
      : selectedPath[selectedPath.length - 1].label
    : null;

  const invalid = nativeValidation.message !== null;
  /* 呼び出し側（FormField / FieldSet 等）が既にエラーを
   * 出しているときは、同じ場所に 2 つ文言が並ばないよう自前の文言は出さない。
   * フォーカスと aria-invalid だけを引き受ける。
   * 判定には注入される aria-invalid も含める（error prop は注入しなくなったため、
   * FormField 経由のエラーは aria-invalid でしか伝わらない）。 */
  const showNativeError = invalid && !error && ariaInvalid !== true;

  const select = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
    setOpen(false);
    nativeValidation.clear();
  };

  const activate = (depth: number, index: number) => {
    setActivePath((prev) => [...prev.slice(0, depth), index]);
  };

  /** ↑↓ で列内、←→ で列間を移動する（カスケードメニューの標準操作） */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return;

    const target = event.target as HTMLElement;
    const depth = Number(target.dataset.depth);
    const index = Number(target.dataset.index);
    if (Number.isNaN(depth) || Number.isNaN(index)) return;

    const focus = (nextDepth: number, nextIndex: number) => {
      const next = panelRef.current?.querySelector<HTMLButtonElement>(
        `[data-depth="${nextDepth}"][data-index="${nextIndex}"]`,
      );
      if (next) {
        event.preventDefault();
        next.focus();
      }
    };

    if (event.key === "ArrowDown") focus(depth, index + 1);
    else if (event.key === "ArrowUp") focus(depth, index - 1);
    else if (event.key === "ArrowRight") focus(depth + 1, 0);
    else if (event.key === "ArrowLeft" && depth > 0) focus(depth - 1, activePath[depth - 1] ?? 0);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          ref={triggerRef}
          disabled={disabled}
          render={<button type="button" />}
          id={id}
          role="combobox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={joinDescribedBy(
            ariaDescribedBy,
            showNativeError && nativeValidation.messageId,
          )}
          aria-invalid={ariaInvalid || error || invalid || undefined}
          data-empty={!label}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-background px-3 text-left text-sm",
            error || invalid ? "border-danger" : "border-input",
            disabled && "opacity-50",
            "data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{label ?? placeholder}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent
          ref={panelRef}
          align="start"
          onKeyDown={onKeyDown}
          className="flex w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-0"
        >
          {columns.map((level, depth) => (
            <ul
              // 階層の深さがそのまま列の同一性。並び替わらないため index キーでよい
              key={depth}
              className={cn(
                "max-h-64 w-56 shrink-0 overflow-y-auto py-1",
                depth < columns.length - 1 && "border-r border-border",
              )}
            >
              {level.map((node, index) => {
                const hasChildren = Boolean(node.children?.length) && depth + 1 < maxLevels;
                const selectable = !node.disabled && !(leafOnly && Boolean(node.children?.length));
                const isSelected = node.value === selectedValue;
                const isActive = activePath[depth] === index;
                return (
                  <li key={node.value}>
                    <button
                      type="button"
                      data-depth={depth}
                      data-index={index}
                      disabled={!selectable && !hasChildren}
                      aria-current={isSelected ? "true" : undefined}
                      onMouseEnter={() => activate(depth, index)}
                      onFocus={() => activate(depth, index)}
                      onClick={() => {
                        if (!selectable) return;
                        select(node.value);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm",
                        selectable ? "hover:bg-muted" : "cursor-default text-muted-foreground",
                        (isActive || isSelected) && selectable && "bg-muted",
                        isSelected && "font-semibold text-primary",
                      )}
                    >
                      <span className="truncate">{node.label}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {node.badge && (
                          <span className="text-xs text-muted-foreground">{node.badge}</span>
                        )}
                        {hasChildren && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ))}
        </PopoverContent>
      </Popover>

      {/* Popover のトリガーはフォームコントロールではないため、
          通常のフォーム送信に値を載せるには input が要る。

          <important>
          type="hidden" にしてはいけない。hidden input は制約検証の対象外
          （barred from constraint validation）なので、required を付けても
          未選択のままフォームが valid になり、name="" が送信される。
          視覚的に隠した text input にすることで required が実際に効く。
          sr-only は display:none ではないため、検証メッセージの表示位置も
          このコンポーネントの近くに出る。
          </important> */}
      {name && (
        <input
          type="text"
          name={name}
          value={selectedValue ?? ""}
          required={required}
          disabled={disabled}
          // 値の変更はツリーの選択で行う。ここへ直接入力させない
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
}

TreeSelect.displayName = "TreeSelect";
