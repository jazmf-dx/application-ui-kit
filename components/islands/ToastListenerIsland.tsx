/**
 * ToastListenerIsland - 全ページ共通のトースト通知ハブ（Django テンプレート用）
 *
 * base.html に 1 つだけ置くことで、プロジェクト全体の通知が toast に
 * 一本化されます。責務は次の 4 つ:
 *
 * 1. Toaster（トーストの表示領域）をマウントする
 *    → 表示領域はページに 1 つだけ。他の Island は表示領域を持たず、ここに相乗りする
 * 2. window.ApplicationToast をグローバル登録する
 *    → 素の JS・htmx から window.ApplicationToast.success(...) で呼べる
 *    → package の export 名は `toast` だが、グローバルは名前空間を持たせるため
 *      `ApplicationToast` のまま据え置く（Django テンプレートとの実行時契約）
 *    → 既存コードが別名（例: `window.DxToast`）を呼んでいるプロジェクトは
 *      `data-global-aliases='["DxToast"]'` で同じ実体を別名にも登録できる
 *    → マウント前に呼ばれた分は `window.__applicationToastQueue`
 *      （`[type, title, description?]` の配列）に溜めておけば、マウント時に消化する
 * 3. Django messages を初期表示する
 *    → data-messages に渡された messages.success()/error() をトースト化
 * 4. `application-toast` CustomEvent を受ける
 *    → サーバーの `HX-Trigger: {"application-toast": {"type": "success", "title": "保存しました"}}`
 *      で、htmx の部分更新の結果をトーストにできる
 *
 * Django テンプレート（base.html）での使い方:
 *
 * ```html
 * <div
 *   data-react="toast-listener"
 *   data-messages='[{"text": "保存しました", "type": "success"}]'
 * ></div>
 * ```
 *
 * data-messages は Django の messages を JSON 化したもの。空なら省略可。
 * 文字列連結で JSON を埋め込まず、`json_script` 等の安全なシリアライズ手段を使うか、
 * テンプレートフィルタでエスケープしてください。
 */

import { useEffect } from "react";
import { type ToastType, Toaster, toast } from "../application/Toast";
import type { ApplicationToastDetail } from "./types";
import "./types";

interface DjangoMessage {
  text: string;
  type: ToastType;
}

export interface ToastListenerIslandProps {
  /** Django messages を JSON 化した配列（オプション） */
  messages?: DjangoMessage[];
  /** `window.ApplicationToast` と同じ実体を登録する別名（既存コードの移行用） */
  globalAliases?: string[];
}

function normalizeType(type: unknown): ToastType {
  return type === "success" || type === "error" || type === "warning" || type === "info"
    ? type
    : "info";
}

export function ToastListenerIsland({ messages, globalAliases }: ToastListenerIslandProps) {
  // グローバル関数を登録し、マウント前に溜まった呼び出しを消化する
  useEffect(() => {
    window.ApplicationToast = toast;
    for (const alias of globalAliases ?? []) {
      (window as unknown as Record<string, unknown>)[alias] = toast;
    }
    const queued = window.__applicationToastQueue;
    if (Array.isArray(queued)) {
      for (const [type, title, description] of queued) {
        toast[normalizeType(type)](title, description);
      }
      queued.length = 0;
    }
  }, [globalAliases]);

  // Django messages を初期表示（複数は少しずつずらして表示）
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const timers = messages.map((msg, index) =>
      window.setTimeout(() => {
        toast[normalizeType(msg.type)](msg.text);
      }, index * 200),
    );
    return () => {
      for (const t of timers) {
        window.clearTimeout(t);
      }
    };
  }, [messages]);

  // HX-Trigger 等から届く CustomEvent
  useEffect(() => {
    const onToastEvent = (event: Event) => {
      const detail = (event as CustomEvent<ApplicationToastDetail>).detail;
      if (!detail) return;
      const title = detail.title ?? detail.text;
      if (!title) return;
      toast[normalizeType(detail.type)](title, detail.description);
    };
    document.body.addEventListener("application-toast", onToastEvent);
    return () => document.body.removeEventListener("application-toast", onToastEvent);
  }, []);

  return <Toaster />;
}
