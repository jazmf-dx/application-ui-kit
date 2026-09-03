/**
 * Breadcrumbs - 現在位置（パンくず）
 *
 * shadcn/ui の Breadcrumb 一式を、`items` 配列 1 本で組み立てる形にしたもの。
 * 末尾の項目を現在地（リンクなし・aria-current="page"）として扱う。
 *
 * テンプレート側の `.breadcrumbs`（tokens/classes.css）と 1:1。
 *
 * <important>
 * - 現在地は必ず末尾に置き、リンクにしない。
 * - PageHeader の `breadcrumbs` に配列を渡せば、この部品が中で描かれる。
 * - PC 優先のため省略記号は持たない。階層が深すぎる場合は情報設計を見直す。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import {
  BreadcrumbItem as BreadcrumbItemPrimitive,
  BreadcrumbLink as BreadcrumbLinkPrimitive,
  BreadcrumbList as BreadcrumbListPrimitive,
  BreadcrumbPage as BreadcrumbPagePrimitive,
  Breadcrumb as BreadcrumbPrimitive,
  BreadcrumbSeparator as BreadcrumbSeparatorPrimitive,
} from "../ui/breadcrumb";

export interface BreadcrumbItem {
  /** 表示ラベル */
  label: React.ReactNode;
  /** リンク先。末尾（現在地）以外で省略するとリンクにならない文字だけになる */
  href?: string;
}

export interface BreadcrumbsProps extends Omit<React.ComponentPropsWithoutRef<"nav">, "children"> {
  /** 上位から順に並べた項目。末尾が現在地 */
  items: BreadcrumbItem[];

  /**
   * nav の読み上げラベル
   * @default "現在位置"
   */
  "aria-label"?: string;
}

/**
 * Breadcrumbs コンポーネント
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: "ホーム", href: "/" },
 *     { label: "アイデア", href: "/ideas/" },
 *     { label: "モニターの増設" },
 *   ]}
 * />
 * ```
 */
export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ items, className, "aria-label": ariaLabel = "現在位置", ...props }, ref) => {
    const lastIndex = items.length - 1;

    return (
      <BreadcrumbPrimitive ref={ref} aria-label={ariaLabel} className={cn(className)} {...props}>
        <BreadcrumbListPrimitive>
          {items.map((item, index) => {
            const isLast = index === lastIndex;
            return (
              <React.Fragment key={index}>
                <BreadcrumbItemPrimitive>
                  {isLast ? (
                    <BreadcrumbPagePrimitive>{item.label}</BreadcrumbPagePrimitive>
                  ) : item.href ? (
                    <BreadcrumbLinkPrimitive href={item.href}>{item.label}</BreadcrumbLinkPrimitive>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </BreadcrumbItemPrimitive>
                {!isLast && <BreadcrumbSeparatorPrimitive />}
              </React.Fragment>
            );
          })}
        </BreadcrumbListPrimitive>
      </BreadcrumbPrimitive>
    );
  },
);

Breadcrumbs.displayName = "Breadcrumbs";
