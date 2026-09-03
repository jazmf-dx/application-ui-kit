# Design System — 画面設計の参照資料

Claude Design 等の AI や人間が**画面をデザインするとき**に渡す、自己完結した設計参照です。
実装コードの正は [components/](../components/)、見た目の正は [tokens/theme.css](../tokens/theme.css)、
使用例の正は Storybook（`bun run storybook`）。ここには判断に必要な要約だけを置きます。

同期ツールのID・実行ログ、props一覧、実装手順、業務ドメイン固有の画面はここに置きません。

| ファイル | 内容 |
|---|---|
| このファイル | デザインの方向性・Token・部品一覧・フィードバックの使い分け |
| [screen-layouts.md](screen-layouts.md) | 画面の起点レイアウト 3 種（Standard / Simple / Focus） |
| [feedback.md](feedback.md) | エラー、確認、成功、空状態の使い分け |
| [component-usage.md](component-usage.md) | 既存部品を選ぶ基準 |

---

## 1. デザインの方向性

社内業務向けの、落ち着いて分かりやすいデザインとする。

- 装飾より、操作性と情報の把握しやすさを優先する
- 情報密度は中〜やや高めを基本とする
- 主操作（Primary Action)は Page Header 付近の分かりやすい位置（通常は右側）に置く

**避ける表現:**

- 過剰な Card 分割
- 大きすぎる見出しや余白
- 意味のない Gradient、強い Shadow、過度な角丸
- 装飾だけを目的とした色や Animation
- 業務画面に適さない Landing Page 風の表現

**実装前提:** shadcn/ui + Tailwind CSS v4。このキットの部品と
semantic token で実装できる構成にする。shadcn/ui で表現できるものを独自 Component 化しない。
Django + React Islands で実装困難な構成を避ける。

---

## 2. Semantic Token

色は「何色か」ではなく「何のための表現か」で選ぶ。raw color（`bg-blue-600` 等)を
主要操作・状態表現の意味として直接使わない。具体値は [tokens/theme.css](../tokens/theme.css) が SSOT
（ライトは青基調、`html.dark` でダークモードにオプトイン）。

| Token | 用途 |
|---|---|
| `primary` (+ `-hover` / `-active` / `-foreground`) | メインアクション（青） |
| `secondary` (+ `-border`) | 補助アクション（白 + グレー枠） |
| `success` / `danger` / `warning` / `info` | 成功・削除/危険・警告・情報 |
| `destructive` | shadcn/ui 互換（`danger` と同値） |
| `background` / `foreground` | ページの地と文字 |
| `card` / `popover` (+ `-foreground`) | 面の地と文字 |
| `muted` / `muted-foreground` | 控えめな面・補足文字 |
| `accent` / `accent-foreground` | hover 等の弱い強調 |
| `border` / `input` / `ring` | 枠線・入力枠・フォーカスリング |

- 既存 Token で表現できる場合は新しい Token を増やさない
- アプリごとのブランド差分は、利用側 CSS の `@theme` 上書きで表現する（部品は変更しない）
- 角丸の基準は `--radius: 0.5rem`。コントロールの高さは 24 / 28 / 32 / 40px の 4 段階

---

## 3. 部品一覧（何を使うか）

まず既存の部品を使う。ここにないものは shadcn/ui → それでもなければ新規検討の順。
仕様・状態・使用例は Storybook の各 Overview を参照。

**このキットが API を設計した部品**（仕様は Storybook を正とする）:

| 部品 | 使う場面 |
|---|---|
| Button / ButtonGroup | 操作。variant = primary / secondary / danger / success |
| Input / SearchInput / Checkbox / RadioGroup / Select / Combobox / DatePicker | フォーム入力。Combobox は検索・新規作成つき選択。説明を見比べて選ばせるなら RadioGroup の `variant="cards"` |
| ScopeSearch | 画面上部の共通検索。1 本の入力で複数種別を横断し、種別ごとのグループで候補を出す |
| FormField / FieldSet | ラベル・必須表示・エラー配置の統一。単一のコントロールは FormField、ラジオ・ボタングループのようなグループ入力は FieldSet |
| Dialog / ConfirmDialog / FormDialog | ダイアログ。破壊的操作の確認は ConfirmDialog（`confirm()` を使わない） |
| toast | 補助的なフィードバック（`alert()` を使わない） |
| Table | 一覧。空状態が必須の API |
| RadioTable | 表から1行を選ばせる。プラン・送付先など列で比較して決める選択 |
| Tabs / Pagination / NavItem | 画面内の切替・送り・ナビゲーション |
| Badge / ActiveIndicator | 状態表示 |
| Dropdown | メニュー |
| ThemeToggle | ライト/ダーク切替 |

**shadcn/ui をそのまま公開している部品:** Card / Spinner / Textarea / Progress /
Empty / Item / Field / Label / Separator（API は shadcn/ui のドキュメントと同じ）。
`FieldSet` はこちらではなく上の表にある。グループ入力のラベル・エラー配置を
引き受ける実装をこのキットが持つため。

**置いていないもの:** 社員選択・組織ツリーなどの業務ドメイン UI（ドメインを所有する
プロジェクト側）。チャート・地図・動画などは利用側で選定する。

---

## 4. エラーとフィードバックの使い分け

| 種類 | 表現 |
|---|---|
| 入力項目のエラー | Field Error（対象フィールドの近く） |
| フォーム全体・業務ルールのエラー | Form Error / Alert（分かりやすい位置） |
| 操作・非同期処理の一時的失敗 | Toast |
| ページ・機能自体を利用できない | Error State / Error Page |
| データがない | Empty State（有効な次の操作がある場合のみ提示） |

- 入力エラーを Toast だけで伝えない。内部例外や stack trace をそのまま表示しない
- 送信失敗時に入力内容を失わない。保存中は二重送信を防止する

---

## 5. 基本操作性

- キーボード操作・フォーカス表示など、部品のアクセシビリティ上の振る舞いを壊さない
- loading / empty / error / disabled / 長い文字列の状態を成立させる
- 狭い画面幅でも主要操作と内容が失われないようにする
- reduced motion 等の利用者設定を不必要に無視しない
- 初期描画時の FOUC・レイアウトシフトを抑える（画像等には固有サイズか aspect-ratio を指定）
