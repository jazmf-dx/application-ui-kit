# ADR-0004: フォーム検証の所有者

**ステータス**: 採用

> **訂正（この ADR を書いたあとの調査で判明）**
>
> 初版は「Base UI 由来の 4 部品（Select / Combobox / Checkbox / RadioGroup）も
> 今この瞬間に同じ状態にある」と書いていたが、**これは誤り**だった。
> Base UI の隠し input は `onFocus` を持ち、ブラウザがそこへフォーカスした瞬間に
> 可視コントロールへ戻している。
>
> ```js
> // @base-ui/react/select/root/SelectRoot.js:397
> onFocus() {
>   // Move focus to the trigger element when the hidden input is focused.
>   store.state.triggerElement?.focus({ focusVisible: true });
> }
> ```
>
> `CheckboxRoot.js:234` / `RadioRoot.js:191` も同じ。したがって
> **フォーカスの行き止まりが起きるのは、このリポジトリが手書きした隠し input を
> 持つ 2 部品（TreeSelect / ButtonGroup）だけ**であり、
> そちらは「決定 1」で対応済み。
>
> Base UI 由来の 4 部品に残っていたのは「可視コントロールに `aria-invalid` と
> エラー文言が結び付かない」ことで、これは Base UI ではなく**このリポジトリの
> 結線の問題**だった（下記「決定 2」を参照）。

## コンテキスト

このキットのフォーム部品は、Popover や ToggleGroup を土台にしているため **それ自体がフォームコントロールではありません**。値を通常のフォーム送信へ載せるために、視覚的に隠した `<input>` を併せて描画しています。この input は支援技術から二重に読まれないよう `aria-hidden="true"` かつ `tabIndex={-1}` です。

これは Base UI（v1.7.0）の実装をそのまま踏襲したものです。`radio` / `select` / `combobox` / `checkbox` / `otp-field` / `number-field` のすべてが同じ形で描画します。

```js
// @base-ui/react/radio/root/RadioRoot.js ほか
style: name ? visuallyHiddenInput : visuallyHidden,
'aria-hidden': true,
tabIndex: -1,
required,
```

### 問題

ネイティブのフォーム検証（`<form>` + `required` + 送信）を使うと、ブラウザは「最初の invalid なコントロール」へ**プログラム的にフォーカスします**。その相手がこの `aria-hidden` な input になります。

支援技術から見ると、存在しないことになっている要素へフォーカスが移ります。結果として、

- どの項目が無効なのか分からない
- 検証メッセージも伝わらない
- 可視のトリガーには `aria-invalid` も付かない

送信はブロックされ続けるため、**原因の項目に到達できないまま詰みます。**

このキットでは次の 2 経路が該当します。

| 経路 | 内容 |
|---|---|
| `Patterns/Search` ではなく `Patterns/Form` の推奨形 | 「フォーム全体を `<form>` で包み `type="submit"` を使う」。見本自体が `Select ... required` を含む |
| `FormDialog` | `formRef.current.requestSubmit()`。`requestSubmit()` は `submit()` と違い対話的な制約検証を走らせる |

### Base UI 側の設計

Base UI はこの状況を想定していないわけではなく、**別の層で解決する設計**です。

| 層 | 役割 |
|---|---|
| 隠し input | 値の運び手のみ。`aria-hidden` は意図的（二重読み上げの回避） |
| `Field` | 可視コントロールへ `aria-invalid` を付け、`validationMessage` をエラー文言として出す |
| `Form` | `noValidate` を付けてネイティブ検証を止め、**自前で可視コントロールへフォーカスする** |

```js
// @base-ui/react/form/Form.js
props: [{
  noValidate: true,
  onSubmit(event) {
    formRef.current.fields.forEach(field => field.validate());
    if (focusFirstInvalid()) { event.preventDefault(); return; }
```

`focusFirstInvalid()` のコメントは「Keep submission blocked, but move focus to the first invalid field that has a **usable control**」です。`Form` を使っていれば、ブラウザが `aria-hidden` な input をフォーカスすること自体が起きません。

隠し input のスタイルを `name` の有無で切り替えているのも同じ配慮です（`visuallyHiddenInput` は `position: absolute` で、万一ネイティブ検証が使われたときに吹き出しが部品の近くへ出る。upstream issue [#3718](https://github.com/mui/base-ui/issues/3718) の修正）。ネイティブ検証との併用は [#3828](https://github.com/mui/base-ui/issues/3828)（open, `docs`）で「ドキュメントと DX を改善する必要がある領域」として認識されています。

### このキットの現状

- `components/ui/field.tsx` は **Base UI の `Field` ではなく** shadcn の素の markup（`fieldset` / `div` / `label` + `cn-field-*`）
- `FormField` は props で受けたエラーを `id` / `aria-describedby` / `aria-invalid` へ結線する**表示部品**
- `Form` 相当は存在しない

つまり **「Base UI から隠し input のパターンだけを受け取り、その前提である `Form` / `Field` 層を持たないまま、ネイティブ検証を推奨している」** 状態です。Base UI の欠陥ではなく、組み合わせの選択の帰結です。

## 決定

**2 段構えにします。**

### 1. 当面（実施済み）

`TreeSelect` と `ButtonGroup` で、送信用 input の `invalid` イベントを横取りします。

```tsx
onInvalid={(event) => {
  event.preventDefault();                                 // ブラウザのフォーカス・吹き出しを止める
  setMessage(event.currentTarget.validationMessage);      // ブラウザのローカライズ済み文言
  visibleControl.focus();                                 // 可視コントロールへ
}}
```

HTML 仕様上、`invalid` をキャンセルするとその要素は "unhandled invalid controls" から外れ、ブラウザによるフォーカスと吹き出しが起きません。**フォームが invalid である事実は変わらないため、送信はブロックされたまま**です。そのうえで可視コントロールに `aria-invalid` とエラー文言を紐づけます。

実装は `components/application/native-validation.tsx` に共有ヘルパとして置きます。

この 2 つを先行させるのは、**このリポジトリが API を設計した部品だから**です。Base UI 由来の 4 部品（Select / Combobox / Checkbox / RadioGroup）には同じ手当てをしていません。それらは 2 の対象です。

### 2. Base UI の `Field` / `Form` 層への載せ替え — **却下**

当初は「キットの Field / Form 層を Base UI の `Field` / `Form` の上に載せ替える」ことを
本筋の案として残していた。調査の結果、これは**採らない**。

理由は 2 つ。

**(a) 上流が想定する使い方に戻すだけで実害が消える。**

`components/ui/*` を上流 shadcn/ui（`apps/v4/registry/bases/base/ui/`）と突き合わせた
ところ、`field.tsx` / `input.tsx` / `textarea.tsx` / `label.tsx` / `radio-group.tsx` /
`input-group.tsx` は import 文以外**差分なし**だった。つまり土台は想定どおり使えている。

問題はすべて `components/application/*` と skin 側にあった。shadcn/ui は
エラー表現を明文化している（https://ui.shadcn.com/docs/components/field）。

> Add `data-invalid` to `Field` to switch the entire block into an error state.
> Add `aria-invalid` on the input itself for assistive technologies.

このキットはその**両方を使えていなかった**。

- `FormField` が `data-invalid` を渡しておらず、`.cn-field` の規則が死んでいた
- `.cn-label` が独自に `text-foreground` を持ち（上流は色を指定しない）、
  `data-invalid` を直しても色が継承されなかった
- `.cn-checkbox` / `.cn-radio-group-item` / `.cn-combobox-chips` は移設時に上流の
  `aria-invalid` 変種を落としており、`aria-invalid` を付けても無反応だった
- `FormField` が独自 prop の `error` を注入しており、受け取らない子では
  DOM へ漏れて React が毎レンダー警告していた
- グループ部品へ `<label for>` を当てており、アクセシブル名が付いていなかった
  （上流はグループに `FieldSet` + `FieldLegend` を使う）

これらを直した結果、載せ替えなしで「エラーが見た目にも支援技術にも伝わる」状態になった。

**(b) 非公開 API への依存が要る。**

`TreeSelect` / `ButtonGroup` のような「単一のフォームコントロールを
持たない部品」を Base UI の `Field` に参加させるには、`@base-ui/react/internals/*`
（`field-root-context` / `field-register-control`）が要る。これは Base UI 自身の Select が
使っている経路だが、ドキュメントにも CHANGELOG にも記載が無く、マイナーで消え得る。
`Field.Control render={...}` で代替すると、登録されるコントロールが隠し input 側になり、
この ADR が扱っている不具合を作り直すことになる。

### 3. 残る制約

Base UI 由来の 4 部品でネイティブ検証が弾いたとき、ブラウザの吹き出しは隠し input の
位置に出る（`visuallyHiddenInput` が `position: absolute` なので部品の近くには出る）。
フォーカスは可視コントロールへ戻るため行き止まりにはならないが、文言は視覚的な
吹き出しだけで、`aria-describedby` では結ばれない。

これを閉じるには `Form` 層（= 却下した案 2）が要る。**既知の未解決事項として残す。**
アプリ側で検証してエラー文言を `FormField error` / `FieldSet error`
へ渡す場合は、この経路を通らないため影響しない。

## 結果

- 1 により、`TreeSelect` / `ButtonGroup` は「未選択で送信 → 可視コントロールにフォーカスとエラー」が成立する
- 2 により、エラー状態の伝達経路が `data-invalid` + `aria-invalid` の 2 本に揃い、独自 prop が消えた。上流の指示どおりに書けば全部品で同じように効く
- グループ部品は `FieldSet` を使う。`FormField` をグループへ使うと名前が付かないことを、Story とテストで固定した
- Base UI へ依存する変更は入れていない。`@base-ui/react/internals/*` への依存も無い
- 残る制約は「3. 残る制約」のとおり

## 見直し

「3. 残る制約」が実際の運用で問題になった場合に、却下した案 2 を再検討します。その前に、
実アプリでネイティブ検証にどの程度依存しているかを確認します。すべてのフォームが React 側で
検証しており `required` が保険としてしか使われていないなら、`Form` 層の `noValidate` の影響は
小さく、案 2 を進めやすくなります。

Base UI へ「隠し input へのプログラム的フォーカスが支援技術に伝わらない」旨を報告する余地も
残っています（[#3828](https://github.com/mui/base-ui/issues/3828) が近いが、支援技術の観点は未報告）。
ただし上流は `onFocus` リダイレクトで既に緩和しているため、優先度は高くありません。
