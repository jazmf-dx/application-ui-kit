/**
 * Button - 共有 UI ライブラリのボタンコンポーネント
 *
 * shadcn/ui の Button をラップし、このリポジトリの意味論的なバリアント名
 * （primary / secondary / danger / success）と `loading` を提供する。
 * 画面側では Button のみを使用し、shadcn/ui の Button を直接使用しないでください。
 *
 * shadcn/ui 本体に `loading` はなく、利用側が Spinner を手で差し込む前提になっている。
 * 送信中にボタンを無効化し忘れる事故を防ぐため、ここで面倒を見る。
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { Button as ButtonPrimitive } from "../ui/button";
import { Spinner } from "../ui/spinner";

/** このリポジトリの意味論的な名前 → shadcn/ui のバリアント名 */
const VARIANT_MAP = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
  success: "success",
  ghost: "ghost",
  link: "link",
} as const;

export type ButtonVariant = keyof typeof VARIANT_MAP;

export interface ButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ButtonPrimitive>, "variant"> {
  /**
   * ボタンのバリアント
   * - primary: メインアクション（作成・送信）- Blue
   * - secondary: 補助操作（キャンセル・戻る）- Gray
   * - danger: 削除・取り消し不可の操作 - Red
   * - success: 保存完了・承認・確定 - Emerald
   * - ghost: 背景なし、ホバーで表示
   * - link: テキストリンク風
   * @default "primary"
   */
  variant?: ButtonVariant;

  /**
   * ローディング状態。true の間はスピナーを表示し、ボタンを無効化する。
   * leftIcon / rightIcon はスピナーに置き換わる。
   */
  loading?: boolean;

  /** 左側に表示するアイコン */
  leftIcon?: React.ReactNode;

  /** 右側に表示するアイコン */
  rightIcon?: React.ReactNode;

  children?: React.ReactNode;
}

/**
 * Button コンポーネント
 *
 * @example
 * ```tsx
 * // 基本的な使い方
 * <Button>保存</Button>
 *
 * // バリアント指定
 * <Button variant="primary">作成</Button>
 * <Button variant="danger">削除</Button>
 *
 * // ローディング状態（自動で disabled になる）
 * <Button loading>送信中...</Button>
 *
 * // アイコン付き
 * <Button leftIcon={<PlusIcon />}>追加</Button>
 *
 * // サイズ指定
 * <Button size="sm">小さいボタン</Button>
 * <Button size="lg">大きいボタン</Button>
 *
 * // フルワイド
 * <Button className="w-full">幅いっぱい</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    // 先頭のアイコン枠。
    //
    // loading 中に leftIcon がある場合、アイコンを DOM から外すと横幅が動く。
    // アイコンごとに光学補正の量が違うため（例: plus は片側 -1.67px、
    // スピナーは -0.34px）、差し替えると文字が 2.67px 横に飛ぶ。
    // そこで元のアイコンは場所取りとして残したまま隠し、スピナーを重ねる。
    // leftIcon がないときは素直にスピナーを流し込む（ここは幅が増えて当然）。
    const overlaySpinner = loading && Boolean(leftIcon);
    const showIconSlot = Boolean(leftIcon) || loading;

    return (
      <ButtonPrimitive
        ref={ref}
        variant={VARIANT_MAP[variant]}
        disabled={disabled || loading}
        // 処理中であることを支援技術にも伝える（見た目のスピナーだけに頼らない）
        aria-busy={loading || undefined}
        className={cn(className)}
        {...props}
      >
        {showIconSlot ? (
          <span
            data-slot="button-icon"
            data-position="start"
            data-loading={overlaySpinner ? "" : undefined}
          >
            {leftIcon}
            {loading ? <Spinner /> : null}
          </span>
        ) : null}
        {children}
        {!loading && rightIcon ? (
          <span data-slot="button-icon" data-position="end">
            {rightIcon}
          </span>
        ) : null}
      </ButtonPrimitive>
    );
  },
);

Button.displayName = "Button";
