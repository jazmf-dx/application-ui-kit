/**
 * Table - 共有 UI ライブラリのテーブルコンポーネント
 *
 * 列定義（columns）とデータ（rows）を渡すと、ヘッダー・行・空状態を
 * 一貫した見た目で描画する。空状態の文言を必ず指定させることで
 * 「データが無いときに何も出ない画面」を防ぐ。
 *
 * <important>
 * これは「見た目の共通化」だけを担う。ソート・ページング・フィルタは
 * 業務ロジックなので各アプリ側で実装し、その結果を rows に渡す。
 * サーバーレンダリング側の一覧はテンプレートで描画し、Table は使わない。
 * </important>
 */

import type * as React from "react";
import { cn } from "../../lib/utils";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "../ui/empty";
import {
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  Table as TablePrimitive,
  TableRow,
} from "../ui/table";

export interface TableColumn<T> {
  /** 列のキー（React の key に使う） */
  key: string;

  /** ヘッダーに表示する内容 */
  header: React.ReactNode;

  /** セルの内容を返す */
  cell: (row: T, rowIndex: number) => React.ReactNode;

  /**
   * 列の寄せ。数値・金額は right、操作ボタンは right が読みやすい。
   * @default "left"
   */
  align?: "left" | "center" | "right";

  /** 列幅（Tailwind クラス。例: "w-32"） */
  className?: string;

  /** ヘッダーセルにだけ付けるクラス */
  headerClassName?: string;
}

export interface TableProps<T> {
  /** 列定義 */
  columns: TableColumn<T>[];

  /** 表示するデータ */
  rows: T[];

  /** 各行の React key を返す。省略すると index を使う（並び替えがある場合は必ず指定） */
  rowKey?: (row: T, index: number) => string | number;

  /**
   * データが 0 件のときに表示する文言。
   * 「なぜ空なのか」「次に何をすればよいか」が分かる文にする。
   * @default "データがありません"
   */
  emptyMessage?: React.ReactNode;

  /** 空状態の補足説明 */
  emptySubMessage?: React.ReactNode;

  /**
   * 行クリック時の処理。渡すと行にホバー・カーソルが付く。
   *
   * 第3引数は click event。行の中にボタンやラジオなど独自に反応する要素を
   * 置く場合は、`event.target` を見てその要素由来のクリックを無視する
   * （無視しないと、要素側の処理と行クリックが二重に走る）。
   */
  onRowClick?: (row: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void;

  /**
   * 行ごとに付けるクラス。選択中・警告などの強調に使う。
   * 行の意味そのもの（無効・エラー）は文字やバッジでも分かるようにする
   * （背景色だけで伝えると色覚特性によって読めない）。
   */
  rowClassName?: (row: T, index: number) => string | undefined;

  /** テーブルの用途を支援技術に伝える説明（視覚的には非表示） */
  caption?: string;

  className?: string;
}

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * Table コンポーネント
 *
 * @example
 * ```tsx
 * type Row = { id: number; name: string; amount: number }
 *
 * <Table<Row>
 *   columns={[
 *     { key: "name", header: "名前", cell: (r) => r.name },
 *     { key: "amount", header: "金額", align: "right",
 *       cell: (r) => `${r.amount.toLocaleString()} 円` },
 *   ]}
 *   rows={rows}
 *   rowKey={(r) => r.id}
 *   emptyMessage="申請がありません"
 *   emptySubMessage="「新規申請」から作成してください"
 * />
 * ```
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "データがありません",
  emptySubMessage,
  onRowClick,
  rowClassName,
  caption,
  className,
}: TableProps<T>) {
  const isEmpty = rows.length === 0;

  return (
    <TablePrimitive className={className}>
      {caption && <TableCaption className="sr-only">{caption}</TableCaption>}

      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              scope="col"
              className={cn(ALIGN_CLASS[col.align ?? "left"], col.className, col.headerClassName)}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {isEmpty ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="py-12">
              {/* 空状態は shadcn/ui の Empty に揃える */}
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>{emptyMessage}</EmptyTitle>
                  {emptySubMessage && <EmptyDescription>{emptySubMessage}</EmptyDescription>}
                </EmptyHeader>
              </Empty>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, i) => (
            <TableRow
              key={rowKey ? rowKey(row, i) : i}
              onClick={onRowClick ? (event) => onRowClick(row, i, event) : undefined}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-accent focus-within:bg-accent",
                rowClassName?.(row, i),
              )}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(ALIGN_CLASS[col.align ?? "left"], col.className)}
                >
                  {col.cell(row, i)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </TablePrimitive>
  );
}

Table.displayName = "Table";
