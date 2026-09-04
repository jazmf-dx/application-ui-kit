/**
 * Pagination - 共有 UI ライブラリのページネーション
 *
 * Table など一覧の下に置く。ページ番号は 1 始まり。
 *
 * shadcn/ui の Pagination はリンク（`<a href>`）前提で、ページ番号の省略記号を
 * 自分で組み立てる必要がある。こちらはコールバック（onPageChange）で動く SPA 向けで、
 * 省略記号のレンジ計算を内蔵している。マークアップは shadcn/ui の nav > ul > li に揃える。
 *
 * `totalCount` を渡すと「N 件中 a–b 件」の件数表記と、`pageSizeOptions` で表示件数の切替も描く。
 * テンプレート側の `.pagination`（tokens/classes.css）と 1:1。
 *
 * <important>
 * ページ番号の計算・現在ページの保持は画面側（またはサーバー）の責務。
 * このコンポーネントは見た目とキーボード操作だけを提供する。
 * </important>
 */

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  Pagination as PaginationPrimitive,
} from "../ui/pagination";

export interface PaginationProps {
  /** 現在のページ（1 始まり） */
  page: number;

  /** 総ページ数。省略時は totalCount / pageSize から求める */
  totalPages?: number;

  /** ページが変わったときに呼ばれる */
  onPageChange: (page: number) => void;

  /** 現在ページの前後に表示するページ数 */
  siblingCount?: number;

  /** 総件数。渡すと「N 件中 a–b 件」を描く（1 ページでも描く） */
  totalCount?: number;

  /** 1 ページの件数（totalCount と組で使う） */
  pageSize?: number;

  /** 表示件数の選択肢。渡すと切替の select を描く */
  pageSizeOptions?: number[];

  /** 表示件数が変わったときに呼ばれる */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * 件数表記の書式
   * @default (from, to, total) => `${total} 件中 ${from}–${to} 件`
   */
  formatSummary?: (from: number, to: number, total: number) => string;

  className?: string;
}

function getPageRange(page: number, totalPages: number, siblingCount: number) {
  const totalNumbers = siblingCount * 2 + 5; // 先頭・末尾・現在・両端の省略記号分
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 2);
  const rightSibling = Math.min(page + siblingCount, totalPages - 1);

  const range: (number | "ellipsis")[] = [1];

  if (leftSibling > 2) range.push("ellipsis");
  for (let i = leftSibling; i <= rightSibling; i++) range.push(i);
  if (rightSibling < totalPages - 1) range.push("ellipsis");

  range.push(totalPages);
  return range;
}

function defaultFormatSummary(from: number, to: number, total: number): string {
  if (total === 0) return "0 件";
  return `${total.toLocaleString()} 件中 ${from.toLocaleString()}–${to.toLocaleString()} 件`;
}

/**
 * Pagination コンポーネント
 *
 * @example
 * ```tsx
 * // ページ送りだけ
 * <Pagination page={page} totalPages={12} onPageChange={setPage} />
 *
 * // 件数表記 + 表示件数の切替（totalPages は totalCount / pageSize から求まる）
 * <Pagination
 *   page={page}
 *   totalCount={238}
 *   pageSize={pageSize}
 *   pageSizeOptions={[20, 50, 100]}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 * ```
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      page,
      totalPages,
      onPageChange,
      siblingCount = 1,
      totalCount,
      pageSize,
      pageSizeOptions,
      onPageSizeChange,
      formatSummary = defaultFormatSummary,
      className,
    },
    ref,
  ) => {
    const resolvedTotalPages =
      totalPages ??
      (totalCount !== undefined && pageSize
        ? Math.max(1, Math.ceil(totalCount / pageSize))
        : undefined);

    if (resolvedTotalPages === undefined) {
      console.warn("[Pagination] totalPages か、totalCount と pageSize の組を指定してください");
      return null;
    }

    const showSummary = totalCount !== undefined;
    const showSizeSelect = Boolean(pageSizeOptions?.length && onPageSizeChange && pageSize);
    const showNav = resolvedTotalPages > 1;

    // 件数も切替も無く 1 ページなら、従来どおり何も描かない
    if (!showSummary && !showSizeSelect && !showNav) return null;

    const from = totalCount && pageSize ? (page - 1) * pageSize + 1 : 0;
    const to = totalCount && pageSize ? Math.min(page * pageSize, totalCount) : 0;

    const items = getPageRange(page, resolvedTotalPages, siblingCount);

    const nav = (
      <PaginationPrimitive ref={ref} aria-label="ページネーション">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="前のページ"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeftIcon />
            </Button>
          </PaginationItem>

          {items.map((item, i) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <Button
                  variant={item === page ? "default" : "ghost"}
                  size="icon-sm"
                  aria-label={`${item} ページ目`}
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="次のページ"
              disabled={page >= resolvedTotalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </PaginationPrimitive>
    );

    if (!showSummary && !showSizeSelect) {
      return <div className={cn("cn-pagination-bar", className)}>{nav}</div>;
    }

    return (
      <div className={cn("cn-pagination-bar", className)}>
        <div className="cn-pagination-meta">
          {showSummary && (
            <p className="cn-pagination-summary" aria-live="polite">
              {formatSummary(from, to, totalCount ?? 0)}
            </p>
          )}
          {showSizeSelect && (
            <label className="cn-pagination-size">
              <span>表示件数</span>
              <select
                value={pageSize}
                onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
              >
                {pageSizeOptions?.map((size) => (
                  <option key={size} value={size}>
                    {size} 件
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {showNav && nav}
      </div>
    );
  },
);

Pagination.displayName = "Pagination";
