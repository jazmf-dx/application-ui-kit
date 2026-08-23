/**
 * ApplicationNavItem - 共有 UI ライブラリのナビゲーション項目
 *
 * リンク（`href` あり）とボタン（`href` なし）の両方になり、選択中は
 * `aria-current="page"` / `aria-pressed` を自動で付ける。
 *
 * <important>
 * このコンポーネントは色を持たない。選択中のアクセント色は
 * `--color-nav-accent`（tokens/theme.css、既定は primary）だけを見る。
 *
 * セクションごとに色を変える場合は、利用側アプリでこのトークンを上書きする。
 * CSS カスタムプロパティは継承するため、セクションのラッパーに一度当てれば
 * 中の項目すべてに効く。
 *
 *   <nav className="nav-section-requests">   // --color-nav-accent を定義したクラス
 *     <ApplicationNavItem href="/requests" active>申請</ApplicationNavItem>
 *   </nav>
 *
 * セクションの集合はアプリ固有なので、キット側に色を列挙しない。
 * </important>
 */

"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ApplicationActiveIndicator } from "./ApplicationActiveIndicator";

interface ApplicationNavItemBaseProps {
  /** 選択中かどうか */
  active?: boolean;

  /** ラベル左のアイコン */
  icon?: ReactNode;

  /** ラベル。`children` でも渡せる */
  label?: ReactNode;

  /** 右端に出すバッジ（件数など） */
  badge?: ReactNode;

  /**
   * 選択中のハイライトを、項目間を移動するアニメーション付きで描画する。
   *
   * `false` にすると静的な背景色になる。サイドバーのように項目が縦に長く
   * 並ぶ場合や、アニメーションを避けたい場合に使う。
   * @default true
   */
  indicator?: boolean;

  /**
   * アニメーションを共有する範囲の識別子。
   * 同じナビゲーション内の項目では同じ値にする。
   * @default "active-nav-indicator"
   */
  layoutId?: string;

  className?: string;
  children?: ReactNode;
}

export type ApplicationNavItemLinkProps = ApplicationNavItemBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ApplicationNavItemBaseProps> & {
    href: string;
  };

export type ApplicationNavItemButtonProps = ApplicationNavItemBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ApplicationNavItemBaseProps> & {
    href?: undefined;
  };

export type ApplicationNavItemProps = ApplicationNavItemLinkProps | ApplicationNavItemButtonProps;

export const ApplicationNavItem = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  ApplicationNavItemProps
>((props, ref) => {
  const {
    href,
    active = false,
    icon,
    label,
    badge,
    indicator = true,
    layoutId = "active-nav-indicator",
    className,
    children,
    onClick,
    ...rest
  } = props;

  const sharedClasses = cn(
    "group relative flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors border border-transparent select-none outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer h-auto",
    active
      ? "text-nav-accent font-semibold"
      : "text-muted-foreground hover:text-foreground hover:bg-accent",
    // indicator を出さない場合は、選択中を静的な背景色で示す
    active && !indicator && "bg-nav-accent/10 border-nav-accent/20",
    className,
  );

  const innerContent = (
    <>
      <span className="relative z-10 flex items-center gap-2.5">
        {icon}
        <span className="truncate">{label ?? children}</span>
      </span>

      {badge !== undefined && badge !== null && (
        <span
          className={cn(
            "relative z-10 px-2 py-0.5 text-xs font-semibold rounded-full",
            active ? "bg-nav-accent/20 text-nav-accent" : "bg-muted text-muted-foreground",
          )}
        >
          {badge}
        </span>
      )}

      {active && indicator && (
        <ApplicationActiveIndicator
          layoutId={layoutId}
          className="bg-nav-accent/10 border-nav-accent/20"
        />
      )}
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={sharedClasses}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      aria-pressed={active}
      className={sharedClasses}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {innerContent}
    </button>
  );
});

ApplicationNavItem.displayName = "ApplicationNavItem";
