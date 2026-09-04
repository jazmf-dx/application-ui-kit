/**
 * Django 連携 Island が共有するグローバル型定義
 *
 * htmx はこのパッケージの依存に含めません。Django テンプレート側で読み込まれた
 * `window.htmx` を利用するだけなので、ここで最小限の型だけを宣言します。
 */

import type { HttpMethod } from "../../lib/confirm-request";
import type { ToastType } from "../application/Toast";

export interface HtmxApi {
  trigger: (element: HTMLElement, eventName: string) => void;
  process: (element: HTMLElement) => void;
  ajax: (
    verb: string,
    path: string,
    context: { target: HTMLElement; swap?: string },
  ) => Promise<void>;
}

/**
 * htmx が全リクエストの前に発火する `htmx:confirm` イベントの detail（必要な部分だけ）。
 * `question` は `hx-confirm` の文言。無いリクエストでは undefined。
 * `issueRequest(true)` で「確認済み」としてリクエストを発行する。
 */
export interface HtmxConfirmDetail {
  question?: string;
  elt: HTMLElement;
  issueRequest: (skipConfirmation?: boolean) => void;
}

/**
 * `confirm-modal` CustomEvent の detail。ConfirmHostIsland が受ける。
 *
 * 利用側の既存実装（Alpine の `$dispatch('confirm-modal', {...})`）と互換にするため、
 * `confirmClass`（danger / warning / primary）と `onConfirm` 関数も受ける。
 */
export interface ConfirmModalDetail {
  title?: string;
  message?: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  /** ダイアログの種類。省略時は confirmClass から決め、それも無ければ danger */
  type?: "info" | "warning" | "danger" | "success";
  /** 旧 API 互換: danger → danger / warning → warning / primary → info */
  confirmClass?: "danger" | "warning" | "primary";
  /** 確定時の処理。url と両方あるときは fetch 成功後に呼ぶ */
  onConfirm?: () => void | Promise<void>;
  /** キャンセル時の処理 */
  onCancel?: () => void;
  url?: string;
  method?: HttpMethod;
  body?: Record<string, unknown>;
  successMessage?: string;
  htmxTrigger?: string;
  redirectUrl?: string;
  reloadOnSuccess?: boolean;
}

/** `application-toast` CustomEvent（`HX-Trigger` から toast を出す）の detail */
export interface ApplicationToastDetail {
  type?: ToastType;
  title?: string;
  /** title の別名（Django messages の `text` と揃える） */
  text?: string;
  description?: string;
}

declare global {
  interface Window {
    htmx?: HtmxApi;
    /**
     * ToastListenerIsland が登録する。素の JS / htmx から
     * window.ApplicationToast.success(...) で呼ぶ。
     *
     * package の export 名は `toast` だが、グローバルは名前空間を持たせるため
     * `ApplicationToast` のまま据え置く。Django テンプレート側との実行時契約で、
     * 型では守られないため改名しない。
     */
    ApplicationToast?: typeof import("../application/Toast").toast;
    /**
     * React がマウントする前に呼ばれた toast を溜めるキュー。
     * base.html のスタブが push し、ToastListenerIsland がマウント時に消化する。
     */
    __applicationToastQueue?: Array<[ToastType, string, string?]>;
    /** ConfirmDialogIsland が id ごとに登録する開閉トリガー */
    openConfirmDialog?: Record<string, () => void>;
    /** FormDialogIsland が id ごとに登録する開閉トリガー */
    openFormDialog?: Record<string, () => void>;
    /** auto-mount が登録する手動マウント API */
    ReactIslands?: {
      mount: (element: HTMLElement, componentName: string) => void;
      initialize: () => void;
    };
  }
}
