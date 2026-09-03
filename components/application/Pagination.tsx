/**
 * Pagination - 共有 UI ライブラリのページネーション
 *
 * Table など一覧の下に置く。ページ番号は 1 始まり。
 *
 * shadcn/ui の Pagination はリンク（`<a href>`）前提で、ページ番号の省略記号を
 * 自分で組み立てる必要がある。こちらはコールバック（onPageChange）で動く SPA 向けで、
 * 省略記号のレンジ計算を内蔵している。マークアップは shadcn/ui の nav > ul > li に揃える。
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

  /** 総ページ数 */
  totalPages: number;

  /** ページが変わったときに呼ばれる */
  onPageChange: (page: number) => void;

  /** 現在ページの前後に表示するページ数 */
  siblingCount?: number;

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

/**
 * Pagination コンポーネント
 *
 * @example
 * ```tsx
 * <Pagination page={page} totalPages={12} onPageChange={setPage} />
 * ```
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ page, totalPages, onPageChange, siblingCount = 1, className }, ref) => {
    if (totalPages <= 1) return null;

    const items = getPageRange(page, totalPages, siblingCount);

    return (
      <PaginationPrimitive ref={ref} aria-label="ページネーション" className={cn(className)}>
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
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </PaginationPrimitive>
    );
  },
);

Pagination.displayName = "Pagination";
