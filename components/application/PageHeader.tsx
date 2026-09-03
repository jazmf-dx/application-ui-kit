/**
 * PageHeader - 画面の見出し領域（見出し・説明・パンくず・主操作・タブ）
 *
 * Application UI Standard §7 の「Main Content 上部に Page Header、Primary Action は
 * Page Header 領域（右側）」を 1 つの部品に固定したもの。純粋なレイアウト部品で、
 * 業務データや権限は持たない。
 *
 * テンプレート側の `.page-header`（tokens/classes.css）と 1:1。
 *
 * <important>
 * - 主操作（primary の Button）は `actions` に置く。本文側に散らさない。
 * - 見出しは既定で h1。1 画面に h1 は 1 つなので、区画の見出しに使うときは
 *   `headingLevel` を 2 以上にする。
 * - `breadcrumbs` に配列を渡せば Breadcrumbs を中で描く。ReactNode を渡せばそのまま置く。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { type BreadcrumbItem, Breadcrumbs } from "./Breadcrumbs";

export interface PageHeaderProps extends Omit<React.ComponentPropsWithoutRef<"header">, "title"> {
  /** 見出し */
  title: React.ReactNode;

  /** 見出しの下に置く 1〜2 行の説明 */
  description?: React.ReactNode;

  /** パンくず。配列なら Breadcrumbs を描く。ReactNode ならそのまま置く */
  breadcrumbs?: BreadcrumbItem[] | React.ReactNode;

  /** 見出しの横に置く状態表示（Badge 等） */
  badge?: React.ReactNode;

  /** 右側の操作群。主操作はここに置く */
  actions?: React.ReactNode;

  /** 見出し領域の下端に置くタブ（Tabs のリスト、またはテンプレートの .tabs 相当） */
  tabs?: React.ReactNode;

  /**
   * 見出し要素のレベル
   * @default 1
   */
  headingLevel?: 1 | 2 | 3;
}

function isBreadcrumbItems(value: PageHeaderProps["breadcrumbs"]): value is BreadcrumbItem[] {
  return Array.isArray(value) && value.every((v) => v && typeof v === "object" && "label" in v);
}

/**
 * PageHeader コンポーネント
 *
 * @example
 * ```tsx
 * <PageHeader
 *   breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "アイデア" }]}
 *   title="アイデア一覧"
 *   description="社内から寄せられた意見・提案を確認します"
 *   actions={<Button variant="primary" leftIcon={<Plus />}>新規作成</Button>}
 * />
 *
 * // 区画の見出しとして（h2）
 * <PageHeader headingLevel={2} title="通知設定" badge={<Badge tone="warning">未設定</Badge>} />
 * ```
 */
export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  (
    {
      title,
      description,
      breadcrumbs,
      badge,
      actions,
      tabs,
      headingLevel = 1,
      className,
      ...props
    },
    ref,
  ) => {
    const Heading = `h${headingLevel}` as const;

    return (
      <header ref={ref} className={cn("cn-page-header", className)} {...props}>
        {isBreadcrumbItems(breadcrumbs) ? <Breadcrumbs items={breadcrumbs} /> : breadcrumbs}
        <div className="cn-page-header-row">
          <div className="cn-page-header-heading">
            <div className="cn-page-header-title-row">
              <Heading className="cn-page-header-title">{title}</Heading>
              {badge}
            </div>
            {description && <p className="cn-page-header-description">{description}</p>}
          </div>
          {actions && <div className="cn-page-header-actions">{actions}</div>}
        </div>
        {tabs && <div className="cn-page-header-tabs">{tabs}</div>}
      </header>
    );
  },
);

PageHeader.displayName = "PageHeader";
