/**
 * toast - 共有 UI ライブラリのトースト通知コンポーネント
 *
 * shadcn/ui の Toast（Base UI の toast manager）をラップし、
 * どこからでも呼べる命令型 API にまとめている。
 * アプリ内の通知はすべて toast に一本化する。
 *
 * `Toaster` をアプリのルート付近に 1 つだけマウントし、
 * React のイベントハンドラやサービス層から下記のメソッドを呼ぶ。
 *
 *   toast.success('保存しました')
 *   toast.error('保存に失敗しました', 'ネットワークエラーです')
 *
 * アイコンは type に応じて Toaster 側（components/ui/toast.tsx）が自動で描画する。
 * title / description には必ずプレーンな文字列を渡す。
 */

import { toast as toastManager } from "../ui/toast";

/** 通知の種類。shadcn/ui の toast type と 1:1 で対応する。 */
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  /** 自動で閉じるまでのミリ秒 */
  duration?: number;
}

const DEFAULT_DURATION = 5000;

function showToast(type: ToastType, title: string, description?: string, duration?: number) {
  toastManager.add({
    title,
    description,
    type,
    timeout: duration ?? DEFAULT_DURATION,
  });
}

export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    showToast("success", title, description, duration),

  error: (title: string, description?: string, duration?: number) =>
    showToast("error", title, description, duration),

  warning: (title: string, description?: string, duration?: number) =>
    showToast("warning", title, description, duration),

  info: (title: string, description?: string, duration?: number) =>
    showToast("info", title, description, duration),

  show: (options: ToastOptions) => {
    const { type = "info", title = "", description, duration } = options;
    showToast(type, title, description, duration);
  },
};

export { Toaster } from "../ui/toast";
