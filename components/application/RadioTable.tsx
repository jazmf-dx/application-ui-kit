/**
 * RadioTable - 表から1行を選ばせる（排他選択つきの一覧）
 *
 * 「候補を複数の属性で見比べてから1つ選ぶ」ための部品。プラン選択・
 * 送付先選択・取り込み対象の選択など、ラベルと説明だけでは決められず
 * 列で並べて比較したい場面に使う。
 *
 * 見た目と空状態は `Table` に委ね、先頭にラジオ列を足しているだけ。
 * 一覧の描画規約（列定義・空状態必須）は Table と同じものが効く。
 *
 * <important>
 * 行クリックでも選択できるようにしてある（ラジオのドットだけを狙わせない）。
 * そのため選択値は内部状態としても保持する。非制御（defaultValue）でも
 * 行クリックが効くのはこのため。
 *
 * 複数選択したい一覧は radio ではなくチェックボックス列を持つ別の設計になる。
 * ここを multiple 対応に広げない。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Table, type TableColumn } from "./Table";

export interface RadioTableProps<T> {
  /** 列定義（ラジオ列は自動で先頭に足される） */
  columns: TableColumn<T>[];

  /** 表示するデータ */
  rows: T[];

  /** 行の選択値を返す。フォーム送信される値になる */
  rowValue: (row: T, index: number) => string;

  /**
   * 支援技術に読ませる行の名前。
   * 省略すると `rowValue` の値が読まれるため、人が読める文字列を渡す。
   */
  rowLabel?: (row: T, index: number) => string;

  /** 選択不可の行 */
  rowDisabled?: (row: T, index: number) => boolean;

  /** 選択値（制御コンポーネントとして使う場合） */
  value?: string;

  /** 初期選択値（非制御の場合） */
  defaultValue?: string;

  /** 選択が変わったときに呼ばれる */
  onValueChange?: (value: string) => void;

  /** 操作不可にする（表全体） */
  disabled?: boolean;

  /** 必須 */
  required?: boolean;

  /** input の name（通常のフォーム送信に含める場合） */
  name?: string;

  /**
   * グループのラベルとなる要素の id。
   *
   * <important>
   * グループには `<label for>` が効かない。ラベルを付けるときは
   * FieldSet を使うか、この prop を渡す。
   * </important>
   */
  "aria-labelledby"?: string;

  /** 説明・エラー文言の id */
  "aria-describedby"?: string;

  /** エラー状態 */
  "aria-invalid"?: boolean;

  /** 各行の React key を返す。省略すると `rowValue` を使う */
  rowKey?: (row: T, index: number) => string | number;

  /** データが 0 件のときの文言 */
  emptyMessage?: React.ReactNode;

  /** 空状態の補足説明 */
  emptySubMessage?: React.ReactNode;

  /** 表の用途を支援技術に伝える説明（視覚的には非表示） */
  caption?: string;

  className?: string;
}

/**
 * RadioTable コンポーネント
 *
 * @example
 * ```tsx
 * type Plan = { id: string; name: string; users: number; price: number }
 *
 * <RadioTable<Plan>
 *   columns={[
 *     { key: "name",  header: "プラン", cell: (p) => p.name },
 *     { key: "users", header: "利用人数", align: "right", cell: (p) => `${p.users} 人` },
 *     { key: "price", header: "月額", align: "right",
 *       cell: (p) => `${p.price.toLocaleString()} 円` },
 *   ]}
 *   rows={plans}
 *   rowValue={(p) => p.id}
 *   rowLabel={(p) => p.name}
 *   name="plan"
 *   defaultValue="standard"
 *   emptyMessage="選べるプランがありません"
 *   caption="契約プランの選択"
 * />
 * ```
 */
export function RadioTable<T>({
  columns,
  rows,
  rowValue,
  rowLabel,
  rowDisabled,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  required,
  name,
  rowKey,
  emptyMessage = "データがありません",
  emptySubMessage,
  caption,
  className,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: RadioTableProps<T>) {
  const reactId = React.useId();
  /* name があってもインスタンスごとの id を混ぜる。name だけで組むと、
   * 同じ name の同じ行を持つフォームが 2 つ（別ダイアログ等）同時に載ったとき
   * id が衝突し、label の htmlFor が先勝ちで別インスタンスを指す。 */
  const idBase = `application-radio-table-${reactId}`;

  // 行クリックで選択するには、非制御でも現在値を知る必要がある。
  //
  // 下の RadioGroup は常に制御（value を渡す）で使う。未選択を undefined に
  // すると Base UI が初回だけ非制御と判断し、最初の選択で
  // 「非制御から制御へ切り替わった」と警告する。未選択は null で表す。
  const [uncontrolled, setUncontrolled] = React.useState<string | undefined>(defaultValue);
  const current = value ?? uncontrolled ?? null;

  const select = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  const radioColumn: TableColumn<T> = {
    key: "__radio",
    header: <span className="sr-only">選択</span>,
    className: "w-10",
    cell: (row, i) => {
      const rowVal = rowValue(row, i);
      const id = `${idBase}-${rowVal}`;
      return (
        // data-slot は行クリック側の判定に使う（下の onRowClick のコメント参照）
        <span data-slot="radio-table-control" className="flex items-center">
          <RadioGroupItem id={id} value={rowVal} disabled={rowDisabled?.(row, i)} />
          {/* 読み上げ名。Base UI が hidden input と id で結ぶ */}
          <label htmlFor={id} className="sr-only">
            {rowLabel ? rowLabel(row, i) : rowVal}
          </label>
        </span>
      );
    },
  };

  return (
    <RadioGroup
      value={current}
      onValueChange={(next) => select(String(next))}
      disabled={disabled}
      required={required}
      name={name}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      className={cn("w-full", className)}
    >
      <Table<T>
        columns={[radioColumn, ...columns]}
        rows={rows}
        rowKey={rowKey ?? ((row, i) => rowValue(row, i))}
        emptyMessage={emptyMessage}
        emptySubMessage={emptySubMessage}
        caption={caption}
        onRowClick={
          disabled
            ? undefined
            : (row, i, event) => {
                // ラジオ自身（と読み上げ用 label / hidden input）のクリックは
                // RadioGroup の onValueChange が拾う。ここで重ねて select すると
                // 1 回の選択で onValueChange が 2 回走る。
                const target = event.target as Element | null;
                if (target?.closest?.("[data-slot='radio-table-control']")) return;
                if (rowDisabled?.(row, i)) return;
                select(rowValue(row, i));
              }
        }
        rowClassName={(row, i) => {
          const rowVal = rowValue(row, i);
          return cn(
            // ホバー色（bg-accent）と別の色にする。同じ色だと
            // 「ホバー中の行」と「選択中の行」が見分けられない。
            rowVal === current && "bg-primary/5 hover:bg-primary/10",
            rowDisabled?.(row, i) && "cursor-not-allowed opacity-60",
          );
        }}
      />
    </RadioGroup>
  );
}

RadioTable.displayName = "RadioTable";
