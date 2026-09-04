# UI Templates

Templateは、複数のPatternとComponentを組み合わせた **画面レベルの構成例** を扱います。

例:

- 一覧 + 検索 + フィルター + ページング
- CRUDの新規作成 / 編集画面
- 詳細画面
- 設定画面
- Dashboard

## Patternとの違い

- Pattern: 「単一選択をどう見せるか」「Empty stateをどう見せるか」など、1つの設計上の問題を扱う
- Template: 一覧画面や詳細画面など、複数のPatternを組み合わせた画面全体を扱う

Templateは完成した業務画面のコピー元ではなく、構成・余白・情報階層・主要操作の置き方を確認するための参照例です。

実案件固有の文言、API、権限、業務ルールは持ち込みません。

## 追加方針

実案件で同じ画面構成を複数回作り、「次回も骨格から考え直すコストが高い」と分かったものだけを追加します。

最初からCRUD、Dashboard、Settings等を網羅的に作ることはしません。

## あるTemplate（Storybook `テンプレート/*`）

利用側3 Applicationでシェル・一覧・詳細・エラーページがそれぞれ複数回作られていたことを根拠に追加した
（[decisions/adr-0007](../decisions/adr-0007-template-class-contract-and-presentation-islands.md)）。

| Story | 内容 | 版 |
|---|---|---|
| 標準アプリ（Standard App） | Global Header + 左Sidebar（NavItem）+ PageHeader + Stat行 + Table（並び替え・選択）+ Pagination | React |
| シンプルアプリ（Simple App） | Header + 中心に構成したフォーム（パターン/フォームの決めごと） | React |
| フォーカスアプリ（Focus App） | Minimal Header（ButtonGroupのToolbar）+ Main Workspace | React |
| 一覧画面（テンプレート版） | page-header → filter-bar（hx-get）→ data-table（th[aria-sort]）→ pagination。**React部品を使わずテンプレート用クラスだけ**で組み、Djangoテンプレートへコピーできる形 | テンプレート |
| 詳細画面 | PageHeader（パンくず・状態・主操作・タブ）+ Alert + Steps + DescriptionList + Accordion | React |
| エラーページ | 404 / 403 / 500（Empty + Button）と、404のテンプレート版 | React + テンプレート |

### 「React版」と「テンプレート版」の使い分け

- 画面をReact Islandで持つ（絞り込み・行選択などclient側のstateがある）→ React版を起点にする
- Django Templateで描く（検索条件を送って一覧を差し替えるだけ）→ テンプレート版を起点にする。
  同じ見た目になるようテンプレート用クラス（`tokens/classes.css`）はReact部品と1:1に揃えてある

### シェルについて

3つのLayout Profileのシェル（`stories/templates/_shell.tsx`）は **Storybookの見本** で、
このキットはpage shellを配布しない。各Applicationの `base.html` / layoutはApplicationが所有し、
Headerの位置・User Menuの位置・Sidebarの役割・Primary Actionの位置だけをこの見本に揃える
（[design-system/screen-layouts.md](../design-system/screen-layouts.md)）。
