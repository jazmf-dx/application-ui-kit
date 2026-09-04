/**
 * Django 連携 Island - 公開エントリ（副作用なし）
 *
 * Django テンプレート + htmx のプロジェクトが、テンプレート側の
 * `data-react="..."` 要素へ React コンポーネントをマウントするための一式です。
 * （判断基準: ai-dev-standards ADR-0002 / このリポジトリの decisions/adr-0001）
 *
 * 通常はこのエントリではなく、副作用込みの auto-mount をアプリのエントリで
 * import するだけで使えます:
 *
 *   // islands/main.ts（アプリの Vite エントリ）
 *   import 'application-ui-kit/islands/auto-mount'
 *
 * アプリ固有の Island を追加する場合はこちらを使います:
 *
 *   import { registerIslandComponents } from 'application-ui-kit/islands'
 *   import 'application-ui-kit/islands/auto-mount'
 *   registerIslandComponents({ 'my-widget': MyWidget })
 *
 * <important>
 * このエントリを import しただけでは何もマウントされません（副作用なし）。
 * マウントの実行は auto-mount 側の責務です。
 * </important>
 */

export { ConfirmDialogIsland } from "./ConfirmDialogIsland";
export type { ConfirmDialogIslandProps } from "./ConfirmDialogIsland";

export { FormDialogIsland } from "./FormDialogIsland";
export type { FormDialogIslandProps } from "./FormDialogIsland";

export { ToastListenerIsland } from "./ToastListenerIsland";
export type { ToastListenerIslandProps } from "./ToastListenerIsland";

export { DatePickerIsland } from "./DatePickerIsland";
export type { DatePickerIslandProps } from "./DatePickerIsland";

export { CopyFieldIsland } from "./CopyFieldIsland";
export type { CopyFieldIslandProps } from "./CopyFieldIsland";

export { ConfirmHostIsland } from "./ConfirmHostIsland";
export type { ConfirmHostIslandProps } from "./ConfirmHostIsland";

export { FileDropZoneIsland } from "./FileDropZoneIsland";
export type { FileDropZoneIslandProps } from "./FileDropZoneIsland";

export { TabsIsland } from "./TabsIsland";
export type { TabsIslandProps, TabsIslandLink } from "./TabsIsland";

export { DisclosureIsland } from "./DisclosureIsland";
export type { DisclosureIslandProps } from "./DisclosureIsland";

export { FieldVisibilityIsland } from "./FieldVisibilityIsland";

export { runConfirmedRequest } from "../../lib/confirm-request";
export type { ConfirmRequestSpec, HttpMethod } from "../../lib/confirm-request";

export {
  getIslandComponent,
  getRegisteredIslandComponents,
  registerIslandComponents,
} from "./registry";

export { parseProps } from "./parse-props";

export { DEFAULT_CSRF_COOKIE_NAME, getCsrfHeaders, getCsrfToken } from "../../lib/csrf";

export type {
  ApplicationToastDetail,
  ConfirmModalDetail,
  HtmxApi,
  HtmxConfirmDetail,
} from "./types";
