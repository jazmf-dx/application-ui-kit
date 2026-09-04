/**
 * DescriptionList - 詳細画面の「項目名と値」
 *
 * 申請番号・申請者・部署・日付のように、項目名と値の組を並べる。
 * 詳細画面で `<dl>` / 2 列の `<table>` / `flex justify-between` が混在していたのを 1 つの形に固定する。
 *
 * テンプレート側の `.description-list`（tokens/classes.css）と 1:1。
 *
 * <important>
 * - 値が主役の指標（件数・率）は `Stat`。ここは「読むための情報」。
 * - 空の値は「—」で描き、行を消さない（無いこと自体が情報）。
 * - 長い値は折り返す。省略記号で隠さない。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";

export interface DescriptionItem {
  /** 項目名 */
  term: React.ReactNode;
  /** 値。null / undefined / 空文字は「—」になる */
  description: React.ReactNode;
  /**
   * 列をまたぐ幅（columns が 2 以上のとき）
   * @default 1
   */
  span?: 1 | 2 | 3;
}

export interface DescriptionListProps
  extends Omit<React.ComponentPropsWithoutRef<"dl">, "children"> {
  /** 項目 */
  items: DescriptionItem[];

  /**
   * 列数
   * @default 1
   */
  columns?: 1 | 2 | 3;

  /**
   * 並び。stacked は項目名の下に値、inline は項目名の右に値
   * @default "stacked"
   */
  layout?: "stacked" | "inline";

  /**
   * 空の値の表記
   * @default "—"
   */
  emptyText?: React.ReactNode;
}

function isEmptyValue(value: React.ReactNode): boolean {
  return value === null || value === undefined || value === "" || value === false;
}

/**
 * DescriptionList コンポーネント
 *
 * @example
 * ```tsx
 * <DescriptionList
 *   columns={2}
 *   items={[
 *     { term: "申請番号", description: "SYS-2026-0001" },
 *     { term: "申請者", description: "山田 太郎" },
 *     { term: "部署", description: "情報システム部" },
 *     { term: "備考", description: note, span: 2 },
 *   ]}
 * />
 * ```
 */
export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ items, columns = 1, layout = "stacked", emptyText = "—", className, ...props }, ref) => {
    return (
      <dl
        ref={ref}
        className={cn("cn-description-list", className)}
        data-columns={columns}
        data-layout={layout}
        {...props}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="cn-description-list-item"
            style={
              item.span && item.span > 1
                ? { gridColumn: `span ${Math.min(item.span, columns)}` }
                : undefined
            }
          >
            <dt className="cn-description-list-term">{item.term}</dt>
            <dd className="cn-description-list-description">
              {isEmptyValue(item.description) ? (
                <span className="cn-description-list-empty">{emptyText}</span>
              ) : (
                item.description
              )}
            </dd>
          </div>
        ))}
      </dl>
    );
  },
);

DescriptionList.displayName = "DescriptionList";
