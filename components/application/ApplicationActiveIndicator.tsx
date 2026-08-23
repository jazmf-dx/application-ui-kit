/**
 * ApplicationNavItem の内部実装。
 *
 * <important>
 * 公開 API ではない（`index.ts` から export しない）。単体では
 * `motion.div` への素通しにすぎず、Application UI Standard §1 の
 * 独自ラッパーの条件を満たさない。
 * </important>
 *
 * 色は持たず、呼び出し側（ApplicationNavItem）が `--color-nav-accent`
 * 由来のクラスを className で渡す。
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ApplicationActiveIndicatorProps {
  layoutId?: string;
  className?: string;
}

export function ApplicationActiveIndicator({
  layoutId = "active-nav-indicator",
  className,
}: ApplicationActiveIndicatorProps) {
  return (
    <motion.div
      layoutId={layoutId}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 border rounded-lg z-0 pointer-events-none bg-primary/10 border-primary/20",
        className,
      )}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    />
  );
}
