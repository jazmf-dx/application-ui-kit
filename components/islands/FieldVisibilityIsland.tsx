/**
 * FieldVisibilityIsland - 選択肢に応じた入力欄の出し分け
 *
 * 「この選択肢のときだけ出す」だけを担う。入力欄そのものは Django Form が描いたままで、
 * この Island は条件に合わない塊へ `hidden` を付けるだけ。何も描画しない。
 *
 * ```html
 * <form …>
 *   <span data-react="field-visibility" hidden></span>
 *   {# 種別が video / pdf のときだけ出す #}
 *   <div data-visible-when='{"kind": ["video", "pdf"]}'>…</div>
 *   {# 完了条件が view で、かつ種別が video 以外のときだけ出す #}
 *   <p data-visible-when='{"completion_rule": "view", "kind": {"not": "video"}}'>…</p>
 *   {# チェックが入っているときだけ出す #}
 *   <div data-visible-when='{"notify": true}'>…</div>
 * </form>
 * ```
 *
 * - キーは **フォーム項目の name**（Django の html_name）。値は文字列・文字列の配列（いずれか）・
 *   真偽値（チェックボックス）・`{"not": …}` のいずれか。複数キーは AND。
 * - スコープは一番近い `<form>`（無ければ親要素）。htmx で差し込まれたモーダルの中でも動く。
 * - `hidden` は DOM を残すので、隠れた欄の値も POST される。捨てる判断はサーバー側の
 *   Form（`clean()`）が持つ。意図してこの挙動にしている。
 * - マウントまでのちらつきは tokens/classes.css の
 *   `[data-visible-when]:not([data-visible-when-ready])` が抑える。
 * - 条件の JSON が壊れているときは隠さない（入力できなくなる方が困る）。警告だけ出す。
 */

import { useEffect, useRef } from "react";

type Condition = Record<string, unknown>;
type FieldValue = string | string[] | boolean | null;

function escapeAttributeValue(name: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(name);
  return name.replace(/["\\]/g, "\\$&");
}

/** name 属性が同じ入力群から、条件判定に使う現在値を作る */
function currentValue(scope: HTMLElement, name: string): FieldValue {
  const inputs = Array.from(
    scope.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `[name="${escapeAttributeValue(name)}"]`,
    ),
  );
  if (!inputs.length) return null;

  const checkboxes = inputs.filter(
    (input): input is HTMLInputElement =>
      input instanceof HTMLInputElement && input.type === "checkbox",
  );
  if (checkboxes.length === 1) return checkboxes[0].checked;
  if (checkboxes.length > 1) return checkboxes.filter((box) => box.checked).map((box) => box.value);

  const radios = inputs.filter(
    (input): input is HTMLInputElement =>
      input instanceof HTMLInputElement && input.type === "radio",
  );
  if (radios.length) return radios.find((radio) => radio.checked)?.value ?? "";

  return inputs[0].value;
}

function matches(expected: unknown, actual: FieldValue): boolean {
  if (expected !== null && typeof expected === "object" && !Array.isArray(expected)) {
    const negated = (expected as { not?: unknown }).not;
    if (negated !== undefined) return !matches(negated, actual);
    return true;
  }
  if (Array.isArray(expected)) return expected.some((value) => matches(value, actual));
  if (typeof expected === "boolean") return Boolean(actual) === expected;
  if (Array.isArray(actual)) return actual.includes(String(expected));
  return String(actual ?? "") === String(expected);
}

function parseCondition(element: HTMLElement): Condition {
  const raw = element.dataset.visibleWhen;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Condition) : {};
  } catch {
    console.warn("[FieldVisibilityIsland] data-visible-when を解釈できません:", raw);
    return {};
  }
}

export function FieldVisibilityIsland() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scope =
      markerRef.current?.closest<HTMLElement>("form") ??
      (markerRef.current?.parentElement as HTMLElement | null);
    if (!scope) return;

    const blocks = Array.from(scope.querySelectorAll<HTMLElement>("[data-visible-when]"));
    if (!blocks.length) return;

    const conditions = new Map(blocks.map((block) => [block, parseCondition(block)] as const));

    const apply = () => {
      for (const [block, condition] of conditions) {
        const visible = Object.entries(condition).every(([name, expected]) =>
          matches(expected, currentValue(scope, name)),
        );
        block.hidden = !visible;
        block.dataset.visibleWhenReady = "";
      }
    };

    apply();
    scope.addEventListener("change", apply);
    scope.addEventListener("input", apply);
    return () => {
      scope.removeEventListener("change", apply);
      scope.removeEventListener("input", apply);
    };
  }, []);

  // 位置の基準だけが要るので、レイアウトに影響しない span を 1 つ置く
  return <span ref={markerRef} hidden />;
}
