/**
 * ConfirmHostIsland - ページに 1 つ置く「確認ダイアログの窓口」
 *
 * 個々の削除ボタンごとに Island を置く ConfirmDialogIsland と違い、
 * この Island はページ全体の確認要求を 1 つの ConfirmDialog で受ける。
 * テンプレート側を書き換えずに、既存の 2 つの呼び方を kit のダイアログへ寄せられる。
 *
 * 1. `hx-confirm`（htmx）
 *    `data-intercept-hx-confirm="true"` を付けると `htmx:confirm` を横取りし、
 *    ネイティブの `window.confirm()` の代わりに ConfirmDialog を出す。
 *    文言は要素の `data-confirm-title` / `data-confirm-text` / `data-confirm-type` /
 *    `data-confirm-cancel-text` で上書きできる（無ければ hx-confirm の文言が本文）。
 *
 *    ```html
 *    <div data-react="confirm-host" data-intercept-hx-confirm="true"></div>
 *    <button hx-delete="/ideas/15/" hx-confirm="このアイデアを削除しますか？"
 *            data-confirm-title="アイデアの削除" data-confirm-text="削除">削除</button>
 *    ```
 *
 * 2. `confirm-modal` CustomEvent（Alpine の `$dispatch('confirm-modal', {...})` 互換）
 *
 *    ```html
 *    <button @click="$dispatch('confirm-modal', {
 *      title: 'アイデアを削除', message: 'この操作は取り消せません。',
 *      confirmText: '削除', confirmClass: 'danger',
 *      onConfirm: () => document.getElementById('delete-form').submit(),
 *    })">削除</button>
 *    ```
 *
 *    detail に `url` / `method` を渡せば fetch（CSRF 付き）も行う（ConfirmModalDetail 参照）。
 *
 * <important>
 * - base.html に 1 つだけ置く。2 つ目は警告を出して何もしない
 *   （複数が `htmx:confirm` を握ると 1 回の削除が複数回飛ぶ）。
 * - `htmx:confirm` は hx-confirm の無いリクエストでも発火する。`question` が無いものは触らない。
 * - 既定の type は danger。宣言的な ConfirmDialogIsland の既定（info）と違うのは、
 *   ここに来る要求の大半が削除・取り消し不能の操作だから。
 * - htmx の読み込みは entry より前に置く（auto-mount と同じ前提）。
 * </important>
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { runConfirmedRequest } from "../../lib/confirm-request";
import { ConfirmDialog, type ConfirmDialogProps } from "../application/ConfirmDialog";
import type { ConfirmModalDetail, HtmxConfirmDetail } from "./types";
import "./types";

export interface ConfirmHostIslandProps {
  /**
   * `htmx:confirm` を横取りして `hx-confirm` を ConfirmDialog で出す
   * @default false
   */
  interceptHxConfirm?: boolean;

  /** CSRF cookie 名（confirm-modal の url を使うときだけ） */
  csrfCookieName?: string;

  /**
   * 文言が無いときの既定タイトル
   * @default "確認"
   */
  defaultTitle?: string;

  /**
   * 既定の確定ボタン文言
   * @default "OK"
   */
  defaultConfirmText?: string;

  /**
   * 既定のキャンセル文言
   * @default "キャンセル"
   */
  defaultCancelText?: string;

  /**
   * 既定の種類
   * @default "danger"
   */
  defaultType?: ConfirmDialogProps["type"];
}

interface PendingConfirm {
  dialog: Pick<
    ConfirmDialogProps,
    "title" | "message" | "detail" | "type" | "confirmText" | "cancelText"
  >;
  run: () => Promise<void>;
  onCancel?: () => void;
}

/** ページ内で `htmx:confirm` / `confirm-modal` を握っている Island。1 つだけ。 */
let hostOwner: symbol | null = null;

const CONFIRM_CLASS_TO_TYPE: Record<
  NonNullable<ConfirmModalDetail["confirmClass"]>,
  NonNullable<ConfirmDialogProps["type"]>
> = {
  danger: "danger",
  warning: "warning",
  primary: "info",
};

export function ConfirmHostIsland({
  interceptHxConfirm = false,
  csrfCookieName,
  defaultTitle = "確認",
  defaultConfirmText = "OK",
  defaultCancelText = "キャンセル",
  defaultType = "danger",
}: ConfirmHostIslandProps) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const confirmedRef = useRef(false);

  const openWith = useCallback((next: PendingConfirm) => {
    confirmedRef.current = false;
    setPending(next);
  }, []);

  useEffect(() => {
    const me = Symbol("confirm-host");
    if (hostOwner !== null) {
      console.warn(
        "[ConfirmHostIsland] confirm-host はページに 1 つだけ置いてください。2 つ目は何もしません。",
      );
      return;
    }
    hostOwner = me;

    const onConfirmModal = (event: Event) => {
      const detail = ((event as CustomEvent<ConfirmModalDetail>).detail ??
        {}) as ConfirmModalDetail;
      const type =
        detail.type ??
        (detail.confirmClass ? CONFIRM_CLASS_TO_TYPE[detail.confirmClass] : undefined);
      openWith({
        dialog: {
          title: detail.title ?? defaultTitle,
          message: detail.message ?? "",
          detail: detail.detail,
          type: type ?? defaultType,
          confirmText: detail.confirmText ?? defaultConfirmText,
          cancelText: detail.cancelText ?? defaultCancelText,
        },
        run: () =>
          runConfirmedRequest({
            url: detail.url,
            method: detail.method,
            body: detail.body,
            csrfCookieName,
            onConfirm: detail.onConfirm,
            successMessage: detail.successMessage,
            htmxTrigger: detail.htmxTrigger,
            redirectUrl: detail.redirectUrl,
            reloadOnSuccess: detail.reloadOnSuccess,
          }),
        onCancel: detail.onCancel,
      });
    };
    document.addEventListener("confirm-modal", onConfirmModal);

    const onHtmxConfirm = (event: Event) => {
      const detail = (event as CustomEvent<HtmxConfirmDetail>).detail;
      // hx-confirm の無いリクエストでも発火する。文言が無いものと、
      // 他のリスナーが先に握ったものは触らない。
      if (!detail?.question || event.defaultPrevented) return;
      event.preventDefault();
      const data = detail.elt?.dataset ?? {};
      const type = data.confirmType as ConfirmDialogProps["type"] | undefined;
      openWith({
        dialog: {
          title: data.confirmTitle ?? defaultTitle,
          message: detail.question,
          type: type ?? defaultType,
          confirmText: data.confirmText ?? defaultConfirmText,
          cancelText: data.confirmCancelText ?? defaultCancelText,
        },
        run: async () => {
          // true = htmx 側の再確認を飛ばす
          detail.issueRequest(true);
        },
      });
    };
    if (interceptHxConfirm) {
      document.body.addEventListener("htmx:confirm", onHtmxConfirm);
    }

    return () => {
      document.removeEventListener("confirm-modal", onConfirmModal);
      if (interceptHxConfirm) {
        document.body.removeEventListener("htmx:confirm", onHtmxConfirm);
      }
      if (hostOwner === me) hostOwner = null;
    };
  }, [
    interceptHxConfirm,
    csrfCookieName,
    defaultTitle,
    defaultConfirmText,
    defaultCancelText,
    defaultType,
    openWith,
  ]);

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    // 確定で閉じたのではなく、キャンセル・Escape・背景クリックで閉じたとき
    if (!confirmedRef.current) {
      pending?.onCancel?.();
    }
    setPending(null);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    confirmedRef.current = true;
    try {
      await pending.run();
    } catch (error) {
      // 失敗はダイアログ内に表示される（ConfirmDialog の契約）。閉じないので確定扱いを戻す
      confirmedRef.current = false;
      throw error;
    }
  };

  return (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={handleOpenChange}
      type={pending?.dialog.type ?? defaultType}
      title={pending?.dialog.title ?? defaultTitle}
      message={pending?.dialog.message ?? ""}
      detail={pending?.dialog.detail}
      confirmText={pending?.dialog.confirmText ?? defaultConfirmText}
      cancelText={pending?.dialog.cancelText ?? defaultCancelText}
      onConfirm={handleConfirm}
    />
  );
}
