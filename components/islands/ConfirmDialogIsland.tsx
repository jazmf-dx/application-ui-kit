/**
 * ConfirmDialogIsland - Django テンプレートから宣言的に使える確認ダイアログ
 *
 * Django テンプレートに以下のように書くだけで使用できます:
 *
 * ```html
 * <div
 *   data-react="confirm-dialog"
 *   data-id="delete-idea-15"
 *   data-title="削除しますか？"
 *   data-message="この操作は取り消せません"
 *   data-type="danger"
 *   data-confirm-text="削除"
 *   data-url="/ideas/15/delete/"
 *   data-method="POST"
 * ></div>
 * ```
 *
 * トリガーボタンは別途用意し、JavaScript で以下を呼び出します:
 *
 * ```html
 * <button onclick="window.openConfirmDialog['delete-idea-15']()">削除</button>
 * ```
 *
 * または CustomEvent から:
 *
 * ```js
 * document.dispatchEvent(new CustomEvent('open-confirm-dialog', { detail: { id: 'delete-idea-15' } }))
 * ```
 *
 * 成功トースト（successMessage）を使う場合は、base.html に toast-listener Island を
 * 置いてください（表示領域はページに 1 つだけ持つ設計のため）。
 *
 * ボタンごとに Island を置かず、`hx-confirm` や `confirm-modal` CustomEvent で
 * ページ全体の確認を 1 つのダイアログで受けたい場合は ConfirmHostIsland を使います。
 */

import { useEffect, useState } from "react";
import { runConfirmedRequest } from "../../lib/confirm-request";
import { ConfirmDialog } from "../application/ConfirmDialog";
import "./types";

export interface ConfirmDialogIslandProps {
  /**
   * ダイアログのタイトル
   */
  title: string;

  /**
   * 確認メッセージ
   */
  message: string;

  /**
   * 詳細メッセージ（オプション）
   */
  detail?: string;

  /**
   * ダイアログのタイプ
   * @default "info"
   */
  type?: "info" | "warning" | "danger" | "success";

  /**
   * 確定ボタンのテキスト
   * @default "OK"
   */
  confirmText?: string;

  /**
   * キャンセルボタンのテキスト
   * @default "キャンセル"
   */
  cancelText?: string;

  /**
   * 確定時にリクエストを送信する URL
   * 指定した場合は、確定時に fetch でリクエストを送信します
   */
  url?: string;

  /**
   * HTTP メソッド（url が指定されている場合のみ有効）
   * @default "POST"
   */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  /**
   * 送信するリクエストボディ（JSON）
   * url が指定されている場合のみ有効
   */
  body?: Record<string, unknown>;

  /**
   * CSRF cookie 名（Django の CSRF_COOKIE_NAME を変更している場合のみ指定）
   * @default "csrftoken"
   */
  csrfCookieName?: string;

  /**
   * 成功時に表示するトーストメッセージ
   * 指定しない場合はトーストを表示しません
   */
  successMessage?: string;

  /**
   * 成功時にページをリロードするか
   * @default false
   */
  reloadOnSuccess?: boolean;

  /**
   * 成功時にリダイレクトする URL
   * 指定した場合は、成功後に window.location.href を変更します
   */
  redirectUrl?: string;

  /**
   * 成功時に発火する htmx イベント名
   * 指定した場合は、document.body に htmx イベントを発行します
   */
  htmxTrigger?: string;

  /**
   * この Island の ID（複数のダイアログを区別するため）
   */
  id?: string;
}

export function ConfirmDialogIsland({
  title,
  message,
  detail,
  type = "info",
  confirmText = "OK",
  cancelText = "キャンセル",
  url,
  method = "POST",
  body,
  csrfCookieName,
  successMessage,
  reloadOnSuccess = false,
  redirectUrl,
  htmxTrigger,
  id,
}: ConfirmDialogIslandProps) {
  const [open, setOpen] = useState(false);

  // 開閉トリガーを登録（CustomEvent / window.openConfirmDialog）
  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: string }>;
      // id が指定されている場合は一致する Island のみ開く
      if (customEvent.detail?.id && customEvent.detail.id !== id) {
        return;
      }
      setOpen(true);
    };

    document.addEventListener("open-confirm-dialog", handleOpen);

    if (id) {
      if (!window.openConfirmDialog) {
        window.openConfirmDialog = {};
      }
      window.openConfirmDialog[id] = () => setOpen(true);
    }

    return () => {
      document.removeEventListener("open-confirm-dialog", handleOpen);
      if (id && window.openConfirmDialog) {
        delete window.openConfirmDialog[id];
      }
    };
  }, [id]);

  // 確定後の処理（fetch・CSRF・toast・htmx trigger・reload）は ConfirmHostIsland と共通。
  // reject すると ConfirmDialog がダイアログ内にエラーを表示する。
  const handleConfirm = () =>
    runConfirmedRequest({
      url,
      method,
      body,
      csrfCookieName,
      successMessage,
      htmxTrigger,
      reloadOnSuccess,
      redirectUrl,
    });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      type={type}
      title={title}
      message={message}
      detail={detail}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={handleConfirm}
    />
  );
}
