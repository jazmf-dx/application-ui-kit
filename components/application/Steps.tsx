/**
 * Steps - 手順の進み具合（ステッパー）
 *
 * 取り込み → 加工 → 出力のような、順番のある手順の「いまどこか」を示す。
 * 手順そのものの画面遷移や検証は呼び出し側が持つ。
 *
 * テンプレート側の `.steps`（tokens/classes.css）と 1:1。
 *
 * <important>
 * - 状態は 4 つ: done（済）/ current（いま）/ error（要対応）/ upcoming（未着手）。
 *   `status` を省くと `current` の位置から自動で決まる。
 * - 戻れる手順だけ `onStepClick` を渡す（done の手順をクリックして戻る）。
 *   先の手順へ飛ばせる設計にはしない。
 * - 手順が 2 つ以下なら使わない。7 つを超えるなら手順を束ね直す。
 * </important>
 */

import { AlertCircle, Check } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

export type StepStatus = "done" | "current" | "error" | "upcoming";

export interface StepItem {
  /** 手順名 */
  label: React.ReactNode;
  /** 1 行の補足 */
  description?: React.ReactNode;
  /** 状態。省略時は `current` の位置から決める */
  status?: StepStatus;
}

export interface StepsProps extends Omit<React.ComponentPropsWithoutRef<"ol">, "children"> {
  /** 手順 */
  items: StepItem[];

  /** 現在の手順（0 始まり）。各項目の `status` が無いときの既定を決める */
  current?: number;

  /**
   * 並び
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /** 済んだ手順をクリックして戻れるようにする */
  onStepClick?: (index: number) => void;
}

function resolveStatus(item: StepItem, index: number, current: number | undefined): StepStatus {
  if (item.status) return item.status;
  if (current === undefined) return "upcoming";
  if (index < current) return "done";
  if (index === current) return "current";
  return "upcoming";
}

/**
 * Steps コンポーネント
 *
 * @example
 * ```tsx
 * <Steps
 *   current={1}
 *   items={[
 *     { label: "取り込み", description: "CSV を選ぶ" },
 *     { label: "加工", description: "列を整える" },
 *     { label: "出力" },
 *   ]}
 *   onStepClick={(i) => goTo(i)}
 * />
 * ```
 */
export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(
  ({ items, current, orientation = "horizontal", onStepClick, className, ...props }, ref) => {
    return (
      <ol ref={ref} className={cn("cn-steps", className)} data-orientation={orientation} {...props}>
        {items.map((item, index) => {
          const status = resolveStatus(item, index, current);
          const clickable = Boolean(onStepClick && status === "done");
          const marker =
            status === "done" ? (
              <Check aria-hidden="true" />
            ) : status === "error" ? (
              <AlertCircle aria-hidden="true" />
            ) : (
              index + 1
            );
          const body = (
            <>
              <span className="cn-step-marker">{marker}</span>
              <span className="cn-step-text">
                <span className="cn-step-label">{item.label}</span>
                {item.description && (
                  <span className="cn-step-description">{item.description}</span>
                )}
              </span>
            </>
          );
          return (
            <li
              key={index}
              className="cn-step"
              data-status={status}
              aria-current={status === "current" ? "step" : undefined}
            >
              {clickable ? (
                <button
                  type="button"
                  className="cn-step-button"
                  onClick={() => onStepClick?.(index)}
                >
                  {body}
                </button>
              ) : (
                <span className="cn-step-button">{body}</span>
              )}
            </li>
          );
        })}
      </ol>
    );
  },
);

Steps.displayName = "Steps";
