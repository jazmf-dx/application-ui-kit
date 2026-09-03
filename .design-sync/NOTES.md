# design-sync notes

## General fixes (apply automatically via config on future syncs)

- **`projectId` is deliberately not committed in `config.json`.** The target Claude Design project differs per owner/fork, so pinning one here would push every fork's sync at a single org's project. Pass the target project at sync time instead (`/design-sync --project <uuid>`, or pick from `list_projects`).
- **`pkg` uses the owner-independent consumer name `application-ui-kit`.** GitHub Packages publishes the physical package as `@<owner>/application-ui-kit`, but consumer code resolves it through the npm alias defined in the consuming application's `package.json`. Keeping design-sync on the same logical package name prevents fork-specific source diffs.

- **[GENERAL] Fixed viewport clips tall Overview stories.** `compare.mjs`'s per-story capture screenshots the DS preview at a *fixed* viewport (default 900x700, `page.screenshot({fullPage:false})`), while the storybook reference side captures the real element and auto-sizes to its content. Any story taller than the viewport is silently cropped in the DS capture with **no validate warning** — the sheet/thumbnail can look fine at a glance while the raw PNG is missing content. Discovered on `NavItem`'s Overview story (1040px of real content, cropped to 700px, hiding the `amber`/`rose`/`emerald` swatches and the whole `LINK / BUTTON` section). Checked all 21 components' storybook-side raw PNG heights against 700px and found 9 affected; fixed via `cfg.overrides.<Name>.viewport`:
  `Table` (900x1150), `NavItem` (900x1100), `FormField` (900x1020), `Input` (900x980), `ButtonGroup` (900x900), `Combobox` (900x870), `DatePicker` (900x870), `RadioGroup` (900x850), `Select` (900x780).
  **Re-check this on every re-sync**: if any component's Overview (or any) story grows past its configured viewport height, it will crop again silently — measure the storybook-side raw PNG height and bump the override if needed.
- **[GENERAL] `.storybook/preview.tsx` decorator never bundles for previews** (`! preview decorator bundle failed: Could not resolve "tailwindcss"` — the decorator's CSS import chain only resolves through the `@tailwindcss/vite` plugin, not esbuild). This means previews never get the decorator's `.dark`-class toggle, the `app-preview font-sans p-6` wrapper div, or the always-mounted `<Toaster />`. Verified harmless for all 21 currently-synced components (colors/fonts come from the `[CSS_FROM_STORYBOOK]` fallback regardless; `ThemeToggle` manages its own `.dark` toggle internally; toast stories only render trigger buttons, not the toast itself). **Risk**: a future component whose *default* (non-interactive) render depends on being inside `.dark` or on `Toaster` being mounted would silently regress without this being caught by validate — no `cfg.provider` has been set because it wasn't needed.
- **[GENERAL] `[TOKENS_MISSING]` for `--tw`, `--toast-index`, `--toast-swipe-movement-x/y`, `--toast-height`, `--toast-offset-y`** — confirmed these are set at runtime by the toast/base-ui primitives, not sourced from a stylesheet; toast stories render correctly. No `cfg.tokensPkg` needed.
- **[GENERAL] この `.design-sync/` の内容は必ず commit すること。** 下の
  "Known false positives" の調査結果は一度、未 commit のまま作業ツリーごと失われている
  （repository の 1.0 再基準化に伴う再 clone）。
  `config.json` / `NOTES.md` / `conventions.md` はいずれも生成物ではなく手で維持する設定・記録で、
  失うと同じ調査をやり直すことになる。

- `Pagination` Overview story overflowed its grid cell width (`[GRID_OVERFLOW] ... wide`) — fixed via `cfg.overrides.Pagination.cardMode: "column"`.

## Known false positives（source側は変更しない）

check が報告するが、実際には修正不要な指摘。**毎回の sync で再度報告される**ので、
その都度ここを参照して同じ調査をやり直さないこと。

- **[GENERAL] トークン抽出が Tailwind v4 のコンパイル出力を DS トークンとして拾う。** check が
  (1) component-style セレクタ配下の custom property 112件（`.cn-button:focus-visible` 等）と
  (2) 分類できないトークン 38種 を報告するが、どちらも誤検知。原因は共通で、トークン抽出が
  `[CSS_FROM_STORYBOOK]` フォールバック（= Tailwind がコンパイルした Storybook の CSS）を
  読んでいること。オーサリング元の `tokens/*.css` には `--tw-` は 1 個も無い
  （`grep -c -- "--tw-" tokens/components.css` → 0）。内訳:
  - **`--tw-*`（(1) の全件 + (2) の 25種）** = Tailwind の box-shadow / transform / animation 合成用の
    作業変数。`.cn-button:focus-visible` 側の `--tw-ring-shadow` / `--tw-ring-offset-width` は
    **`:root` へ移してはいけない**（ring が全要素に効いて壊れる）。実テーマ値は
    `--tw-ring-color: var(--color-ring)` として正しく参照されており `--color-ring` は登録済み。
  - **モーショントークン 7種** = 本物のトークン。`--motion-duration-fast` /
    `--motion-duration-base` / `--motion-ease-default` / `--default-transition-duration` /
    `--default-transition-timing-function` / `--animate-spin` / `--animate-pulse`。
    check 側に motion の分類が無いため「分類できない」に落ちているだけで、値は正しい。
    後ろの 4 種は Tailwind のデフォルトテーマ由来で、このリポジトリに定義箇所は無い。
  - **コンポーネント内部変数 4種** = `--lk-halfstep`（`tokens/scale.css`）、`--lk-state-hover`、
    `--lk-state-active`（同）、`--icon-empty`（`tokens/icon-metrics.generated.css`）。
    兄弟の `--lk-icon-air` / `--lk-icon-gap` / `--lk-icon-inset` / `--lk-state-*-on-fill` /
    `--icon-box` / `--icon-fix` は check に分類できている。

- **[GENERAL] 「ダークテーマ未定義」は誤検知。対応不要。** `.dark` スコープの surface /
  foreground / border 上書きセットは `tokens/theme.css` の `.dark` ブロックに定義済みで、
  コンパイル結果にも `.dark{--color-background:…}` として 17 プロパティ分が出ている
  （`storybook-static` の CSS で実測確認）。このリポジトリは Tailwind 既定の
  `@media (prefers-color-scheme: dark)` ではなく
  `@custom-variant dark (&:where(.dark, .dark *))` によるクラス方式オプトインを
  **意図的に**採っている（理由は theme.css のコメント: 利用側テンプレートが `bg-white` 直書きの
  ままだと OS 設定だけで画面が半分暗くなって破綻する）。check が `prefers-color-scheme` か
  `[data-theme]` を探しているなら `.dark` を見落とす。
  **`@media (prefers-color-scheme: dark)` を足してはいけない** — 上の設計判断を直接壊す。

- **[GENERAL] driver 側の正式な除外・token source 指定方法は未確認。上記を source 側で
  回避しようとしないこと。** 検討して**却下した**案を、再検討の手間を省くために残す。
  - `cfg.tokensIgnore` に `"--tw-*"` 等を書く案 → **却下**。driver / converter のソースを
    参照できず、このキー名が実際に読まれるか確認できていない。driver が知らないキーは黙って
    無視されるため、「fix」として入れても誤検知が消える保証が無い。
  - `cfg.tokensPkg` へ切り替える案 → **却下**。`tokensPkg` は通常 `node_modules/<package>` に
    存在する**別の** token package を指す設定で、UI Platform 自身が token source である
    このリポジトリでは自己参照の代替にならない。
  - `tokens/motion.css` の `@theme` へ Tailwind 既定値（`--default-transition-duration` /
    `--default-transition-timing-function` / `--animate-spin` / `--animate-pulse`）を
    ピン留めして注釈を付ける案 → **却下**。利用側の `input.css` は
    `@import "tailwindcss"` の**後**に `application-ui-kit/styles.css` を読むため
    （`scripts/fixtures/consumer/backend/static/css/input.css`）、pin すると利用側が
    カスタマイズした transition / animation 変数を UI Kit が上書きする。元々 Tailwind が
    所有していた変数の所有権を、Design Sync のメタデータのためだけに奪うことになる。
    リポジトリ内のビルド出力だけを比較すると「バイト一致・挙動不変」に見えるが、
    **利用側は検証できていない**。この落とし穴のため再度 pin しないこと。

  driver で正式にサポートされた除外・token source 指定を確認できた時点で、別途対応する。

## Cosmetic changes worth knowing about

- **Catalog grouping flattened from curated subgroups to a flat "components" group.** The previously-uploaded project organized cards into `data-display`/`forms`/`actions`/`overlays`/`navigation`/`primitives`/`surfaces` — but every story title in this repo (`stories/components/*.stories.tsx`) is a flat two-level `Components/<Name>`, and group is derived mechanically from the title segment above the component name (`common.mjs#titleParts`). Checked git blame — these titles have always been flat two-level for every file checked, so the old subgrouping was almost certainly hand-curated via a `cfg.titleMap`/fork config from a prior sync we have no record of (see "lost local state" below), not something this repo's stories ever encoded. The driver's diff correctly treated this as a "pure regroup" (its `deletePaths` remove every component's old grouped path alongside the new flat path in `writes`) rather than a contract change, so no grades were lost. If the curated subgroups are wanted back, either restructure story titles to `Components/<Category>/<Name>` in the repo, or reintroduce a group-remapping config — there is currently no `cfg` knob that overrides `group` independent of the title path.

## Re-sync risks

- **9 primitives lost their standalone stories, not their exports.** `Card`, `Empty`, `Field`, `Item`, `Label`, `Progress`, `Separator`, `Spinner`, `Textarea` are still re-exported as plain shadcn/ui passthroughs from `components/application/index.ts`, but commit `ff5c673` ("shadcn/ui gen3 (Base UI) へ移行し、公開APIを整理する") removed their dedicated `.stories.tsx` files — they now only appear embedded inside Pattern/Template stories (`Form`, `EmptyState`, `gallery/AllComponents`, etc.). This sync correctly reports them as `removed` and drops their cards, since the storybook shape can only verify components with their own stories. If standalone Catalog cards are wanted again for these, they need dedicated story files restored.
- **`ActiveIndicator` is invisible to this sync.** It exists in the compiled `dist/`/exports but has no story anywhere under `stories/`, so the converter never considers it (not `added`, not `removed` — just never seen). Confirm with the team whether it's meant to be Catalog-visible; if so it needs a story.
- **This session started from a lost local `.design-sync/` state.** The Claude Design project this repo syncs into already held a complete prior sync, but this repo checkout had no `.design-sync/config.json`, no `NOTES.md`, and no `previews/` overrides — they were apparently never committed before a prior session's container was recycled (this is an ephemeral remote-execution repo). No owned preview overrides were needed this run (every component rendered correctly from the generated wrapper), but there's no history of *why* past fixes were made. This NOTES.md is the first durable record — keep it committed on every future sync.
- **`docs: 0/21 components matched` in the build log.** The converter's doc discovery (`cfg.docsMap`/`cfg.dtsPropsFor`) found no matching source docs for any component, so `.prompt.md` content is generated from `.d.ts` + story source only, not from the components' own JSDoc comments (which are often rich, e.g. `Button.tsx`'s variant descriptions). Not a blocker, but a future sync could investigate `cfg.componentSrcMap`/`cfg.docsMap` to surface those JSDoc blocks in the generated prompt docs.
