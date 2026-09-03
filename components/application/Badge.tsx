/**
 * Badge - 共有 UI ライブラリのバッジ（ステータス表示）コンポーネント
 *
 * shadcn/ui の Badge を土台に、業務ステータス向けの色調（tone）を載せたもの。
 * shadcn/ui の variant（default / secondary / destructive / outline / ghost / link）は
 * 「役割」の表現で、ドメインの状態（未対応・対応中・完了…）を表せないため tone を持つ。
 *
 * <important>
 * バッジは色だけに意味を持たせない。セマンティックカラーは WCAG AA 未達のため、
 * 必ず文字（「完了」「未対応」等）で意味が読み取れるようにする。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { Badge as BadgePrimitive } from "../ui/badge";

export type BadgeTone = "new" | "active" | "done" | "warning" | "danger" | "pending" | "neutral";

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  /**
   * 意味に対応した色調
   * - new: 新規・未対応・要注意（Yellow）
   * - active: 進行中（Sky）
   * - done: 完了・解決・承認（Emerald）
   * - warning: 差戻し・警告（Orange）
   * - danger: 緊急・エラー・却下（Rose）
   * - pending: 検討中・保留（Purple）
   * - neutral: 終了・無効・アーカイブ（Gray）
   * @default "neutral"
   */
  tone?: BadgeTone;

  /** 先頭に表示するアイコン */
  icon?: React.ReactNode;
}

/* 色は tokens/tokens.css の --color-status-* に集約してある（light / dark の両方を Token 側が持つ）。
 * テンプレート側の .badge-{tone}（tokens/classes.css）と同じ Token を引くので見た目が揃う。 */
const TONE_CLASS: Record<BadgeTone, string> = {
  new: "bg-status-new text-status-new-foreground",
  active: "bg-status-active text-status-active-foreground",
  done: "bg-status-done text-status-done-foreground",
  warning: "bg-status-warning text-status-warning-foreground",
  danger: "bg-status-danger text-status-danger-foreground",
  pending: "bg-status-pending text-status-pending-foreground",
  neutral: "bg-status-neutral text-status-neutral-foreground",
};

/**
 * Badge コンポーネント
 *
 * @example
 * ```tsx
 * // 基本
 * <Badge tone="active">対応中</Badge>
 *
 * // 一覧のステータス列
 * <Badge tone={statusToneMap[row.status]}>{row.statusLabel}</Badge>
 *
 * // アイコン付き
 * <Badge tone="danger" icon={<AlertCircleIcon />}>エラー</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ tone = "neutral", icon, children, className, ...props }, ref) => {
    return (
      <BadgePrimitive
        ref={ref}
        // ghost を土台にして tone のユーティリティで色を上書きする。
        // tone は utilities レイヤーなので、cn-badge-variant-* より後勝ちになる。
        variant="ghost"
        className={cn(TONE_CLASS[tone], className)}
        {...props}
      >
        {icon}
        {children}
      </BadgePrimitive>
    );
  },
);

Badge.displayName = "Badge";
