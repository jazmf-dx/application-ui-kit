/**
 * 確認ダイアログ「確定」後の処理（Django 連携 Island 用）
 *
 * ConfirmDialogIsland（宣言的な data-* 指定）と ConfirmHostIsland（`hx-confirm` の横取り、
 * `confirm-modal` CustomEvent）が同じ手順を踏むための共通実装。
 *
 *   1. url があれば fetch（CSRF ヘッダ付き）。失敗は throw する
 *      （ConfirmDialog が reject を受けてダイアログ内にエラーを表示する契約）
 *   2. onConfirm があれば await する
 *   3. successMessage があれば toast
 *   4. htmxTrigger があれば document.body に htmx イベントを発火
 *   5. reloadOnSuccess なら reload、そうでなく redirectUrl があれば遷移
 */

import { toast } from "../components/application/Toast";
import { getCsrfHeaders } from "./csrf";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ConfirmRequestSpec {
  /** 確定時にリクエストを送信する URL */
  url?: string;
  /** HTTP メソッド（url がある場合のみ） @default "POST" */
  method?: HttpMethod;
  /** 送信するリクエストボディ（JSON。url がある場合のみ） */
  body?: Record<string, unknown>;
  /** CSRF cookie 名（Django の CSRF_COOKIE_NAME を変更している場合のみ） */
  csrfCookieName?: string;
  /** 確定時に実行する処理。url がある場合は fetch 成功後に実行する */
  onConfirm?: () => void | Promise<void>;
  /** 成功時に表示するトースト */
  successMessage?: string;
  /** 成功時にページをリロードする */
  reloadOnSuccess?: boolean;
  /** 成功時にリダイレクトする URL（reloadOnSuccess が優先） */
  redirectUrl?: string;
  /** 成功時に document.body へ発火する htmx イベント名 */
  htmxTrigger?: string;
}

export async function runConfirmedRequest(spec: ConfirmRequestSpec): Promise<void> {
  const { url, method = "POST", body, csrfCookieName } = spec;

  if (url) {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(csrfCookieName),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `リクエストに失敗しました (${response.status})`);
    }
  }

  if (spec.onConfirm) {
    await spec.onConfirm();
  }

  if (spec.successMessage) {
    toast.success(spec.successMessage);
  }

  if (spec.htmxTrigger && typeof window.htmx !== "undefined") {
    window.htmx.trigger(document.body, spec.htmxTrigger);
  }

  if (spec.reloadOnSuccess) {
    window.location.reload();
  } else if (spec.redirectUrl) {
    window.location.href = spec.redirectUrl;
  }
}
