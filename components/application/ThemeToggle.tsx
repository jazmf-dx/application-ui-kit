"use client";

import { Moon, Sun } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

export interface ThemeToggleProps {
  /** カスタムCSSクラス */
  className?: string;
  /** アイコンに適用するCSSクラス (デフォルト: "w-4 h-4") */
  iconClassName?: string;
  /** アクセシビリティ用ラベル (デフォルト: "テーマ切り替え") */
  ariaLabel?: string;
  /**
   * カスタムの切り替えハンドラー。
   * 指定しない場合、html要素の .dark クラスおよび localStorage('theme') を自動切り替えします。
   */
  onToggle?: (isDark: boolean) => void;
  /** 現在のテーマを指定（制御モード） */
  theme?: "light" | "dark";
}

export function ThemeToggle({
  className,
  iconClassName = "w-4 h-4",
  ariaLabel = "テーマ切り替え",
  onToggle,
  theme: controlledTheme,
}: ThemeToggleProps) {
  const [internalDark, setInternalDark] = React.useState(false);

  // 非制御時の title 表示用に、マウント後に実テーマを状態へ同期する。
  // アイコンの表示自体はこの状態に依存しない（下の CSS 出し分けを参照）。
  // ここで待たされるのは title 文言だけなので、描画のちらつきは起きない。
  React.useEffect(() => {
    setInternalDark(document.documentElement.classList.contains("dark"));
  }, []);

  const isDark = controlledTheme ? controlledTheme === "dark" : internalDark;

  const handleToggle = () => {
    // effect 実行前のクリックでは internalDark がまだ DOM と同期していないため、
    // 非制御時の現在値は常に DOM から読む
    const currentDark = controlledTheme
      ? controlledTheme === "dark"
      : typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const nextDark = !currentDark;

    if (!controlledTheme && typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", nextDark);
      try {
        localStorage.setItem("theme", nextDark ? "dark" : "light");
      } catch (_) {}
      setInternalDark(nextDark);
    }

    onToggle?.(nextDark);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        // [--icon-box:1rem] はアイコンの光学補正の計算基準（iconClassName の既定 w-4 と揃える）
        "[--icon-box:1rem] p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      title={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      aria-label={ariaLabel}
    >
      {controlledTheme ? (
        controlledTheme === "dark" ? (
          <Sun className={cn(iconClassName, "text-amber-400")} />
        ) : (
          <Moon className={cn(iconClassName, "text-indigo-600 dark:text-indigo-400")} />
        )
      ) : (
        <>
          {/* 非制御時は html の .dark クラスで CSS 出し分けする。
              マウント（useEffect）を待ってから描くと、その間アイコンが空になり
              1 フレーム以上のちらつきになる。SSR でも同じ HTML を返せるので
              ハイドレーション不一致も起きない。 */}
          <Sun className={cn(iconClassName, "text-amber-400 hidden dark:inline-block")} />
          <Moon className={cn(iconClassName, "text-indigo-600 inline-block dark:hidden")} />
        </>
      )}
    </button>
  );
}
