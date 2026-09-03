"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ActiveIndicatorProps {
  layoutId?: string;
  className?: string;
}

export function ActiveIndicator({
  layoutId = "active-nav-indicator",
  className,
}: ActiveIndicatorProps) {
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
