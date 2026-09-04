/**
 * DisclosureIsland - サーバーが描いた塊の開閉だけを持つ見出しボタン
 *
 * 「完了したコース（12）」のように、見出し + 件数のボタンを描き、対象要素の `hidden` を
 * 切り替える。対象の中身は Django Template のまま。
 *
 * ```html
 * <div data-react="disclosure"
 *      data-props='{"targetId": "completed-courses", "label": "完了したコース", "count": 12}'></div>
 * <div id="completed-courses" hidden>…（サーバーが描いた表）…</div>
 * ```
 *
 * - サーバー側では対象に `hidden` を付けて閉じた状態で描く（`initialOpen` なら付けない）。
 * - JS を使わずに済む単純な開閉は、テンプレート用クラスの `<details class="disclosure">`
 *   （tokens/classes.css）で足りる。件数の動的更新や見出しレベルの制御が要るときだけこの Island。
 */

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../application/Badge";

export interface DisclosureIslandProps {
  /** 開閉する要素の id */
  targetId: string;
  /** 見出しの文字 */
  label: string;
  /** 見出しの右に出す件数（省略時は出さない） */
  count?: number | string;
  /**
   * 最初から開くか
   * @default false
   */
  initialOpen?: boolean;
  /**
   * 見出し要素のレベル
   * @default 2
   */
  headingLevel?: 2 | 3 | 4;
}

export function DisclosureIsland({
  targetId,
  label,
  count,
  initialOpen = false,
  headingLevel = 2,
}: DisclosureIslandProps) {
  const [open, setOpen] = useState(initialOpen);
  const Heading = `h${headingLevel}` as const;

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) {
      console.warn(`[DisclosureIsland] #${targetId} が見つかりません`);
      return;
    }
    target.hidden = !open;
  }, [targetId, open]);

  return (
    <button
      type="button"
      className="cn-disclosure-toggle"
      aria-expanded={open}
      aria-controls={targetId}
      onClick={() => setOpen((value) => !value)}
    >
      <Heading className="cn-disclosure-toggle-label">{label}</Heading>
      {count !== undefined && <Badge tone="neutral">{count}</Badge>}
      <ChevronDown
        aria-hidden="true"
        className={`cn-disclosure-toggle-icon${open ? " rotate-180" : ""}`}
      />
    </button>
  );
}
