/**
 * React Island レジストリ
 *
 * `data-react="component-name"` と React コンポーネントの対応表です。
 * このパッケージ標準の Island（auto-mount.tsx の一覧を参照）は auto-mount エントリが自動登録します。
 * アプリ固有の Island は registerIslandComponents() で追加してください
 * （業務ドメイン固有の UI はこのパッケージには追加せず、アプリ側で登録します）。
 */

import type { ComponentType } from "react";

const registry = new Map<string, ComponentType<any>>();

/**
 * Island コンポーネントを登録する
 *
 * @example
 * ```ts
 * import { registerIslandComponents } from 'application-ui-kit/islands'
 * registerIslandComponents({ 'my-widget': MyWidget })
 * ```
 */
export function registerIslandComponents(components: Record<string, ComponentType<any>>): void {
  for (const [name, component] of Object.entries(components)) {
    registry.set(name, component);
  }
}

/** data-react 属性の値からコンポーネントを取得する */
export function getIslandComponent(name: string): ComponentType<any> | null {
  return registry.get(name) ?? null;
}

/** 登録済みコンポーネント名の一覧 */
export function getRegisteredIslandComponents(): string[] {
  return Array.from(registry.keys());
}
