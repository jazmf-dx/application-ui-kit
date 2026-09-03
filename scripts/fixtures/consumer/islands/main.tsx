/* パッケージの export 面をまとめて触る。
 *
 * 名前を列挙せず namespace import にしているのは、export が増減しても
 * fixture を追従させなくて済むようにするため。非巻き上げレイアウトでは、
 * パッケージが package.json に宣言していない依存 (phantom dependency) を
 * ここで解決できずビルドが落ちる。 */
import * as kit from "@hamirilo/application-ui-kit";
import * as islands from "@hamirilo/application-ui-kit/islands";

// 副作用エントリ。import しただけで data-react 要素を自動マウントする。
import "@hamirilo/application-ui-kit/islands/auto-mount";

const surface: Record<string, unknown> = { ...kit, ...islands };

if (Object.keys(surface).length === 0) {
  throw new Error("パッケージから export が 1 つも読めていません");
}

const missing = Object.entries(surface)
  .filter(([, value]) => value === undefined)
  .map(([name]) => name);

if (missing.length > 0) {
  throw new Error(`export が欠けています: ${missing.join(", ")}`);
}

/* v6.2.0 は非破壊リリースなので、無印の新名と Application* の旧名エイリアスの
 * 両方が引けることを確かめる。旧名が落ちていれば利用側の既存コードが壊れる。
 * 全件は index.test.ts が見るので、ここは代表と例外だけを押さえる。 */
const NEW_NAMES = ["Button", "DatePicker", "FieldSet", "toast", "Toaster", "Table"];
const LEGACY_NAMES = [
  "ApplicationButton",
  "ApplicationDatePicker",
  "ApplicationFieldSet",
  "ApplicationToast",
  "ApplicationToaster",
  "ApplicationTable",
  "APPLICATION_COMBOBOX_CREATE_PREFIX",
];

for (const [label, names] of [
  ["新名", NEW_NAMES],
  ["旧名エイリアス", LEGACY_NAMES],
] as const) {
  const absent = names.filter((name) => surface[name] === undefined);
  if (absent.length > 0) {
    throw new Error(`${label} が引けません: ${absent.join(", ")}`);
  }
}

// 旧名は新名と同じ実体を指していること（別物を掴んでいたら移行後に挙動が変わる）。
if (surface.ApplicationButton !== surface.Button || surface.ApplicationToast !== surface.toast) {
  throw new Error("旧名エイリアスが新名と別の実体を指しています");
}

// rollup が未使用として落とさないよう、実体を副作用のある形で参照する。
(globalThis as Record<string, unknown>).__applicationUiKitVerify = surface;
