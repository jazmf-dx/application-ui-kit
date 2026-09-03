# ADR-0007: テンプレート用CSS classの公開契約と、見せ方だけを持つIsland

**ステータス**: 採用

**関連**: [ADR-0001](adr-0001-django-htmx-islands.md)（Django接続Islandsの置き場所。このADRで種別を1つ足す）、
[ADR-0003](adr-0003-domain-ui-boundary.md)（ドメインUIとの境界。変えない）

> ADR-0005は欠番。このrepositoryの他のADRが参照する「ADR-0005」は
> ai-dev-standardsのADR-0005（upstream fork運用）を指す。番号を埋め直さない（Governance 1.1）。

## コンテキスト

利用側Application 3つ（Django Templates + htmx + React Islands）の実装を突き合わせた結果、次が分かった。

1. **UIの大半はDjango Templateで描かれている。** このキットがテンプレート向けに配っているクラスは
   `.btn-*` / `.input-field` / `.badge` / `.card` / `.avatar-*` / `.data-table` の6族だけで、
   alert・パンくず・タブ・ページ見出し・統計タイル・ページ送りはApplicationごとに独自CSSで定義されている。
   Applicationあたり千行規模の重複があり、React部品との見た目の差も生んでいる。
2. **サーバーが描いたHTMLの見せ方だけを切り替えるUI**（タブ切替・開閉・選択肢に応じた入力欄の出し分け）を、
   Applicationが自前の薄いIslandや軽量frameworkで埋めている。`Tabs` Componentはcontentをpropsで受ける
   設計のため、Django Formが描いたHTMLの切替には使えない。利用側のADRは「キットに同じ性質のIslandが
   入るまで自前を維持する」と明記している。
3. 確認ダイアログの呼び方が `hx-confirm` / CustomEvent / `window.openConfirmDialog` / 素の `confirm()` に
   分裂し、受け手の無い呼び出しが残っているApplicationもある。
4. `design-system/feedback.md` は「Form Error / Alert」を定義しているが、Alert Componentも
   テンプレート用 `.alert` も存在しなかった。

Standard側では [ai-dev-standards ADR-0007](https://github.com/hamirilo/ai-dev-standards/blob/main/decisions/adr-0007-presentation-only-islands-and-template-classes.md)
が「見せ方だけのUIとテンプレート側共通classはUI Platformが所有する」と決めた。
このADRは、それをこのrepositoryでどう配布するかを決める。

## 決定

### 1. `tokens/classes.css` をテンプレート用クラスの公開契約とする

- `tokens/theme.css` を `tokens.css`（Token具体値）/ `components.css`（cn-*スキン）/ `classes.css`
  （テンプレート用クラス）の3ファイルに分け、`theme.css` は3つを @import する入口に留める。
  `application-ui-kit/styles.css` は従来どおり `theme.css` を指す。
- `classes.css` の `@layer components` に並ぶクラス名が公開契約。**追加はMINOR、rename / 削除はMAJOR。**
- 分けた理由: 利用側の一部は `tokens/components.css` だけをimportしており、そこに `.alert` 等を足すと
  次の `bun install` で自前の同名クラスと衝突する。`classes.css` に分けておけば、
  利用側が自分のタイミングで取り込める。

### 2. テンプレート用クラスとReact Componentは1:1

- 対応表は `design-system/README.md`「Djangoテンプレートから使うクラス」、見本はStorybook「基礎/テンプレート用クラス」。
- 片方だけに部品を増やさない。`tokens/components.css.test.ts` が代表的な対（`.cn-alert` ↔ `.alert` 等）の
  両存在を検査する。
- 命名は接頭辞なし・部品名そのまま（`.alert` / `.breadcrumbs` / `.page-header` / `.stat`）。
  部位は `部品-部位`（`.alert-title`）、意味は `部品-意味`（`.alert-danger` / `.badge-done`）。
  例外として、Base UIのToggle（押しボタン）と混同するため **スイッチは `.toggle` ではなく `.switch`**、
  短すぎて他所と当たる **定義リストは `.dl` ではなく `.description-list`** とする。
- DOM契約は利用側の現行マークアップに合わせる。`.breadcrumbs > :is(ul, ol) > li`（`<ul>` も `<ol>` も当たる）、
  `.tab-active` と `.tab[aria-selected="true"]` の両方にスタイルを当てる、など。
  「自前が勝って何も変わらない」事故を防ぎ、利用側が同名定義を消すだけで移行できるようにするため。

### 3. テンプレート用クラスはSemantic Tokenだけで書く

- 色は `var(--color-*)` のみ。raw palette（Tailwindの色名 + 番号）とダーク用バリアントを書かない
  （`tokens/components.css.test.ts` が検査）。利用側が `.dark` でも `[data-theme]` でも、
  `--color-*` を差し替えれば暗くなる。
- 淡い面は `color-mix(in oklab, var(--color-xxx) 12%, var(--color-card))` で導出し、面用のTokenを増やさない。
- 業務状態の色（未対応・対応中・完了…）は `--color-status-{tone}` / `-foreground` としてTokenに持ち、
  Reactの `Badge tone` とテンプレートの `.badge-{tone}` が同じTokenを引く。
  以前は `Badge` がraw paletteを直接使っており、CLAUDE.mdの「raw colorを追加しない」と矛盾していた。
- `--lk-*`（scale.css）は既存のアイコン光学補正にだけ使い、新しいクラスでは使わない。
  scale.cssを取り込まない利用側でも壊れないようにするため。

### 4. 「見せ方だけを持つIsland」をIslandsの第2種として追加する

ADR-0001の標準Island（toast / confirm / form-dialog / date-picker / copy-field）は
「値を書き戻す・fetchする」ものだった。これに次を加える。

| Island | 役割 |
|---|---|
| `tabs` | `[data-tab-panel]` のラベルからタブバーを描き、`hidden` を切り替える |
| `disclosure` | 見出しボタンを描き、対象要素の `hidden` を切り替える |
| `field-visibility` | `data-visible-when` の条件で塊の `hidden` を切り替える（Django Formの描画はそのまま） |
| `confirm-host` | ページに1つ。`hx-confirm` の横取りと `confirm-modal` CustomEventを受けてConfirmDialogを開く |

契約:
- contentはサーバー描画のまま。Islandは操作部の描画と `hidden` の付け外しだけを持つ。
- 初期非表示はサーバー側で `hidden` を付ける（JS無効でも初期表示の1枚が見える）。
- 隠れた入力欄の値はPOSTされる。捨てる判断はDjango Formの `clean()` に置く。
- props・data属性は利用側の既存実装と互換にし、registryの差し替え1行で移行できる形にする。
- `confirm-host` は既存のConfirmDialogIslandを変えず別Islandにする。1ページに複数置かれた
  ConfirmDialogIslandがそれぞれ `htmx:confirm` を握ると、1回の削除が複数回飛ぶため。

### 5. 含めないもの

- ページシェル・グリッド等のレイアウト → Templates（Storybook `テンプレート/*`）
- 業務ドメインUI → 所有project（ADR-0003）
- htmx自体、Application固有のcookie名・URL → 利用側とPlaybook

## 理由

| 案 | 内容 | 判断 |
|---|---|---|
| A | テンプレート用CSSは各Applicationが持ち、キットはReactだけ配る | 却下。Applicationごとに千行規模の重複と見た目差が続く |
| B | テンプレート側もReact Componentに置き換えさせる | 却下。Django Formの描画をReactへ渡し直すことになり、JSON APIとvalidationの複製を招く |
| C | キットがテンプレート用クラスと薄いIslandを配布し、React Componentと1:1に揃える | 採用 |

- 案Cは、Django側にForm / SSR / authorizationを残すというArchitecture Standard §2の目的をそのまま守れる。
- テンプレート用クラスとReact Componentを同じrepositoryで所有すると、Tokenの変更が両方へ同時に反映される。
- キットは既に `.btn-*` 等のテンプレート用クラスとDjango接続Islandsを配布しており、責務境界を新設しない。

## 結果

- package 6.xのMINORで配布できる。既存の `.btn-*` 等の契約は変えない。
- Storybook「基礎/テンプレート用クラス」がテンプレート実装者の見本になる。
- 利用側は自前の同名クラスと薄いIslandを、変更箇所から順に削除できる。一括migrationは要求しない。
- 制約: クラス一覧が公開契約になるため、`classes.css` の変更は対応表とStoryの更新を伴う。
- 既知の衝突（利用側の採用時に確認するもの）:
  - `.alert-error`（利用側）→ `.alert-danger`（キット）
  - `.dx-page-title` / `.dx-stat-*` → `.page-header-title` / `.stat-*`
  - `.toggle`（checkbox方式の利用側）→ `.switch`
  - `.badge-*` を独自に定義している利用側は、意味の対応を突合してから削除する
  - Django adminの `div.breadcrumbs` と同名。キットのCSSはadminには読ませない
  - `.btn-primary` の高さ（キット32px / 利用側40pxの例あり）。読み込み順で自前が勝つと差が出ないまま残る

## 実装フェーズ

| フェーズ | 内容 |
|---|---|
| 1（このADRと同時） | theme.css分割、`.alert*` / `.breadcrumbs` / `.page-header*` / `.stat*` / `.badge-{tone}` / `.disclosure*`、Alert / Breadcrumbs / PageHeader / Stat、status Token |
| 2 | `tabs` / `disclosure` / `field-visibility` / `confirm-host` / `file-drop-zone` Island、`.tabs*`、FileDropZone、Accordion / Collapsible |
| 3 | Tableの並び替え状態・行選択・固定ヘッダ、Paginationの件数表示、`.switch` / `.pagination*` / `.description-list` / `.steps*`、Steps / Switch / Tooltip / DescriptionList |
| 4 | Storybook Templates（Standard / Simple / Focus App、一覧テンプレート版、詳細、エラーページ） |

## 見直し

汎用Islandで表現できない見せ方の制御が複数Applicationで繰り返された場合、
React Componentへ寄せるかhtmxで解くかを利用実績に基づいて再判断する。
