/**
 * TabsIsland - サーバーが描いたパネルの「見せ方だけ」を切り替えるタブ
 *
 * パネルの中身は Django Template のまま（Django Form・権限・htmx 属性をそのまま活かす）で、
 * この Island はタブバーの描画とパネルの表示状態だけを持つ。
 * `Tabs` Component（content を props で受ける）はこの用途には使えないため、別 Island にしてある
 * （decisions/adr-0007）。
 *
 * テンプレート側の約束:
 *
 * ```html
 * <div data-tab-host>
 *   <div data-react="tabs" data-props='{"initial": "materials", "label": "コースの設定"}'></div>
 *   <div data-tab-panel="basic"     data-tab-label="基本情報">…</div>
 *   <div data-tab-panel="materials" data-tab-label="教材"
 *        data-tab-count-id="material-count" hidden>…</div>
 * </div>
 * ```
 *
 * - タブの並び・ラベル・有無は **パネル側の属性が正**。`{% if perms %}` でパネルを
 *   出さなければタブも出ない（一覧を props に二重で書かない）。
 * - 初期表示しないパネルにはサーバー側で `hidden` を付ける。付けないとマウントまでの
 *   一瞬すべてのパネルが見える。
 * - 件数は `data-tab-count-id` が指す要素から読む。htmx の hx-swap-oob がその要素を
 *   差し替えるので、`htmx:afterSettle` のたびに読み直す（パネル集合も再収集する）。
 * - 切替後に `data-tab-autofocus` を持つ要素へフォーカスを移す（バーコード入力など）。
 * - 切替時に host へ `tabs:change`（detail.value = key）を発火する。
 *   `hx-trigger="tabs:change[detail.value=='history'] from:closest [data-tab-host]"` で
 *   遅延ロードできる。
 * - `urlParam` を渡すと `?param=key` を history.replaceState で同期する（既定は同期しない。
 *   `hx-push-url` と競合するため）。
 *
 * 見た目はテンプレート用クラス `.tabs` / `.tab` / `.tab-active`（tokens/classes.css）。
 */

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export interface TabsIslandLink {
  href: string;
  label: string;
}

export interface TabsIslandProps {
  /** 初期表示するタブ（data-tab-panel の値）。無い値なら先頭のパネルを開く */
  initial?: string;
  /** タブバーの右に並べる別ページへのリンク（例: 送信履歴） */
  links?: TabsIslandLink[];
  /** タブバーの aria-label */
  label?: string;
  /** 指定すると、選択中のタブを `?<urlParam>=key` に同期する */
  urlParam?: string;
}

interface PanelInfo {
  key: string;
  label: string;
  countId: string | null;
  element: HTMLElement;
}

/** data-tab-host 配下のパネルを DOM の順序どおりに集める */
function collectPanels(host: HTMLElement): PanelInfo[] {
  return Array.from(host.querySelectorAll<HTMLElement>("[data-tab-panel]")).map(
    (element, index) => {
      const key = element.dataset.tabPanel || `tab-${index}`;
      if (!element.id) element.id = `tab-panel-${key}`;
      return {
        key,
        label: element.dataset.tabLabel || key,
        countId: element.dataset.tabCountId || null,
        element,
      };
    },
  );
}

function readCounts(panels: PanelInfo[]): Record<string, string> {
  const counts: Record<string, string> = {};
  for (const panel of panels) {
    if (!panel.countId) continue;
    const holder = document.getElementById(panel.countId);
    if (holder) counts[panel.key] = (holder.textContent || "").trim();
  }
  return counts;
}

function readUrlParam(name: string | undefined): string | null {
  if (!name || typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

function writeUrlParam(name: string, value: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState(window.history.state, "", url);
}

export function TabsIsland({ initial, links = [], label, urlParam }: TabsIslandProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLElement | null>(null);
  // 切り替え後にパネル内の入力へフォーカスを移すかどうか（初期表示では移さない）
  const focusPendingRef = useRef(false);
  const [panels, setPanels] = useState<PanelInfo[]>([]);
  const [active, setActive] = useState<string>("");
  const [counts, setCounts] = useState<Record<string, string>>({});

  // レイアウト確定前に走らせる。useEffect にするとタブバーが 1 フレーム空になる。
  useLayoutEffect(() => {
    const host = rootRef.current?.closest<HTMLElement>("[data-tab-host]");
    if (!host) {
      console.warn("[TabsIsland] 親に data-tab-host が見つかりません");
      return;
    }
    hostRef.current = host;
    const found = collectPanels(host);
    setPanels(found);
    setCounts(readCounts(found));
    // URL > initial > サーバーが付けた表示状態 > 先頭。不正な値でどのパネルも開かない状態にはしない
    const fromUrl = readUrlParam(urlParam);
    const visible = found.find((panel) => !panel.element.hidden)?.key;
    const candidates = [fromUrl, initial, visible];
    const initialKey =
      candidates.find((key) => key && found.some((panel) => panel.key === key)) ?? found[0]?.key;
    setActive(initialKey || "");
  }, [initial, urlParam]);

  // 表示状態は DOM 側（サーバーが描いた要素）に反映する
  useEffect(() => {
    if (!active) return;
    for (const panel of panels) {
      panel.element.hidden = panel.key !== active;
      panel.element.setAttribute("role", "tabpanel");
      panel.element.setAttribute("aria-labelledby", `tab-${panel.key}`);
    }
    if (!focusPendingRef.current) return;
    focusPendingRef.current = false;
    // 表示を切り替えた後でないと focus() が効かない（display:none の要素は取れない）
    panels
      .find((panel) => panel.key === active)
      ?.element.querySelector<HTMLElement>("[data-tab-autofocus]")
      ?.focus();
  }, [panels, active]);

  // htmx の部分更新（hx-swap-oob 等）で件数やパネルが差し替わるたびに読み直す
  useEffect(() => {
    const refresh = () => {
      const host = hostRef.current;
      if (!host || !host.isConnected) return;
      const found = collectPanels(host);
      setPanels(found);
      setCounts(readCounts(found));
    };
    document.body.addEventListener("htmx:afterSettle", refresh);
    return () => document.body.removeEventListener("htmx:afterSettle", refresh);
  }, []);

  const activate = useCallback(
    (key: string, options: { focusPanel?: boolean } = {}) => {
      focusPendingRef.current = Boolean(options.focusPanel);
      setActive(key);
      if (urlParam) writeUrlParam(urlParam, key);
      hostRef.current?.dispatchEvent(
        new CustomEvent("tabs:change", { bubbles: true, detail: { value: key } }),
      );
    },
    [urlParam],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = panels.findIndex((panel) => panel.key === active);
    const last = panels.length - 1;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowRight"
            ? (index + 1) % panels.length
            : (index - 1 + panels.length) % panels.length;
    const target = panels[next];
    if (!target) return;
    activate(target.key);
    rootRef.current?.querySelector<HTMLElement>(`#tab-${target.key}`)?.focus();
  };

  return (
    <div ref={rootRef} role="tablist" aria-label={label} className="tabs" onKeyDown={onKeyDown}>
      {panels.map((panel) => {
        const isActive = panel.key === active;
        const count = counts[panel.key];
        return (
          <button
            key={panel.key}
            id={`tab-${panel.key}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panel.element.id}
            tabIndex={isActive ? 0 : -1}
            className={isActive ? "tab tab-active" : "tab"}
            onClick={() => activate(panel.key, { focusPanel: true })}
          >
            {count === undefined ? panel.label : `${panel.label} (${count})`}
          </button>
        );
      })}
      {links.map((link) => (
        <a key={link.href} href={link.href} className="tab">
          {link.label}
        </a>
      ))}
    </div>
  );
}
