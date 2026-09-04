/**
 * Template Story 共通の画面シェル（Storybook 専用。`_` 始まりなので Story 収集対象外）。
 *
 * Application UI Standard §7 の Layout Profile 3 種を、このキットの部品だけで組む。
 *
 *   Standard App  Global Header + 左 Sidebar + Page Header + Main
 *   Simple App    Header + Main（中心に構成）
 *   Focus App     Minimal Header（主操作 / Toolbar 込み）+ Main Workspace
 *
 * 強く揃えるのは Header の基本位置・User Menu の位置・Sidebar の役割・Primary Action の位置。
 * Content 幅や Grid はアプリ要件で変えてよい（design-system/screen-layouts.md）。
 *
 * <important>
 * これは「構成の見本」で、コピーして使うシェル実装ではない。アプリの base.html / layout は
 * アプリが所有する（このキットは page shell を配布しない。ADR-0007「含めないもの」）。
 * </important>
 */

import { Bell, ChevronDown, Menu } from "lucide-react";
import type * as React from "react";
import {
  Avatar,
  AvatarFallback,
  Button,
  Dropdown,
  NavItem,
  type NavItemColor,
} from "../../components/application";

export interface ShellNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: React.ReactNode;
  activeColor?: NavItemColor;
}

function UserMenu({ name = "山田 太郎" }: { name?: string }) {
  return (
    <Dropdown
      align="end"
      trigger={
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="ユーザーメニュー"
        >
          <Avatar size="sm">
            <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{name}</span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </button>
      }
      items={[
        { key: "profile", label: "プロフィール" },
        { key: "settings", label: "通知設定" },
        { key: "logout", label: "ログアウト", separatorBefore: true },
      ]}
    />
  );
}

/** Global Header。左にアプリ名、右に通知とユーザーメニュー（位置は全プロファイルで固定）。 */
export function GlobalHeader({
  appName,
  minimal = false,
  toolbar,
  onMenuClick,
}: {
  appName: string;
  /** Focus App 用。高さを抑え、主操作の Toolbar を中央に置く */
  minimal?: boolean;
  toolbar?: React.ReactNode;
  onMenuClick?: () => void;
}) {
  return (
    <header
      className={
        minimal
          ? "flex h-11 items-center gap-3 border-b border-border bg-card px-3"
          : "flex h-14 items-center gap-3 border-b border-border bg-card px-4"
      }
    >
      {onMenuClick && (
        <Button variant="ghost" size="icon-sm" aria-label="メニュー" onClick={onMenuClick} className="lg:hidden">
          <Menu />
        </Button>
      )}
      <a href="#" className="text-sm font-semibold text-foreground">
        {appName}
      </a>
      {toolbar && <div className="ml-4 flex flex-1 items-center gap-2">{toolbar}</div>}
      <div className="ml-auto flex items-center gap-1">
        {!minimal && (
          <Button variant="ghost" size="icon-sm" aria-label="通知">
            <Bell />
          </Button>
        )}
        <UserMenu />
      </div>
    </header>
  );
}

/** 左 Sidebar。主要ナビゲーション。 */
export function Sidebar({ items, footer }: { items: ShellNavItem[]; footer?: React.ReactNode }) {
  return (
    <nav aria-label="主要ナビゲーション" className="flex w-56 shrink-0 flex-col gap-1 border-r border-border bg-card p-3">
      {items.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          active={item.active}
          icon={item.icon}
          label={item.label}
          badge={item.badge}
          activeColor={item.activeColor}
        />
      ))}
      {footer && <div className="mt-auto pt-3">{footer}</div>}
    </nav>
  );
}

/** Standard App: Global Header + Sidebar + Main。Page Header は children の先頭に置く。 */
export function StandardShell({
  appName,
  nav,
  children,
}: {
  appName: string;
  nav: ShellNavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[640px] flex-col bg-background text-foreground">
      <GlobalHeader appName={appName} onMenuClick={() => {}} />
      <div className="flex flex-1">
        <div className="hidden lg:flex">
          <Sidebar items={nav} />
        </div>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

/** Simple App: Header + Main（中心に構成）。Sidebar を持たない。 */
export function SimpleShell({
  appName,
  children,
  width = "max-w-2xl",
}: {
  appName: string;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="flex min-h-[640px] flex-col bg-background text-foreground">
      <GlobalHeader appName={appName} />
      <main className={`mx-auto w-full flex-1 p-6 ${width}`}>{children}</main>
    </div>
  );
}

/** Focus App: Minimal Header（Toolbar 込み）+ Main Workspace（残り全部）。 */
export function FocusShell({
  appName,
  toolbar,
  children,
}: {
  appName: string;
  toolbar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[640px] flex-col bg-background text-foreground">
      <GlobalHeader appName={appName} minimal toolbar={toolbar} />
      <main className="relative flex-1 overflow-hidden bg-muted/40">{children}</main>
    </div>
  );
}
