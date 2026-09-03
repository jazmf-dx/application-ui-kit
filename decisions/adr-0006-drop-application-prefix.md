# ADR-0006: 公開APIから `Application` 接頭辞を撤廃する

**ステータス**: 採用

## コンテキスト

公開Componentは全て `Application` 接頭辞を持っていました（`ApplicationButton` / `ApplicationDatePicker` …）。JSXが冗長で読みづらいという声が出発点でしたが、調べると読みやすさより先に構造の問題がありました。

[components/application/index.ts](../components/application/index.ts) は接頭辞に「`Application*` = このrepositoryがAPIを設計したもの / 無印 = shadcn/uiをそのままre-export」という意味を持たせていました。この区別に価値が残っているかを調べた結果、次の4点が分かりました。

**1. 接頭辞の出自はshadcn/uiとの区別ではない。** `e7d3095 refactor: generalize UI kit naming` は `components/hamirilo/Hamirilo*` → `components/application/Application*` の一括改名で、owner名を汎用語へ置き換えただけでした。当時のindex.tsは「画面側ではApplication UI Kit Componentのみを使用し、shadcn/uiを直接使用しないでください」で、全Componentが接頭辞付き、区別は存在しませんでした。上記の意味は後の `ff5c673`（shadcn/ui gen3移行）で既存の接頭辞へ後付けされたものです。

**2. 名前と実態がずれている。** `Application*` 27個のうち6個は `components/ui/` を一切importしない完全自作でした（ActiveIndicator / ConfirmDialog / FormDialog / CopyButton / NavItem / ThemeToggle）。接頭辞は「shadcn/ui由来かどうか」を表していません。実際に表していたのは「このrepositoryがAPIを設計したか」だけで、それは由来とは別軸です。

**3. 利用側はこの区別を一度も使っていない。** 利用側5repositoryのimport文を集計した結果、packageからimportされている識別子は18種すべて `Application*` でした。無印のre-export群（Card / Spinner / Textarea / Progress / Empty / Item / Field / Label / Separator）は1件もimportされていません。あるApplicationはCardとSeparatorを自repositoryへvendoringして使っていました。**呼び出し側から見える名前は100%が接頭辞付きで、全てに付く接頭辞は何も区別していません。**

**4. 接頭辞が昇格/降格を破壊的改名に変える。** `ff5c673` で `ApplicationCard` → `Card`、`ApplicationTextarea` → `Textarea`、`ApplicationSpinner` → `Spinner`、`ApplicationProgress` → `Progress` の降格が実際に起きました。index.ts自身が「独自の振る舞いが必要になった時点で `Application*` に昇格させてください」と昇格を前提にしています。**由来を名前にencodeしている限り、境界が動くたびに利用側の破壊的改名になります。**

## 決定

1. **公開APIの名前は接頭辞なしで統一する。** `ApplicationButton` → `Button`。
2. **由来は名前ではなくindex.tsのsectionで表す。** 「このrepositoryがAPIを設計したもの」と「shadcn/uiをそのままre-exportしているもの」の2sectionを維持し、後者にはshadcn/uiのドキュメントがそのまま使えることを書く。
3. **昇格/降格は名前を変えずに行う。** どのsectionにあるかは実装の内部事情として扱う。
4. **移行は段階的に行う。** v6.2.0で実装を無印へ改名し、旧名を `@deprecated` エイリアスとして残す（非破壊）。各Applicationが順次移行したあと、v7.0.0で旧名を削除する。
5. **例外を3つ置く。**
   - `ApplicationToast` → **`toast`**（小文字）。Componentではなく命令型APIのオブジェクトであり、`components/ui/toast.tsx` はComponentの `Toast` を別に持つ。sonner / react-hot-toast / shadcn/uiが命令型APIに使う慣習に合わせる。
   - `FieldSet` はshadcn/uiのre-exportをやめ、このrepositoryの実装が名前を持つ。両者は同じ名前を欲しがっており、グループ入力のラベル・必須・エラー配置を引き受けるこちらを公開APIとする。
   - **`window.ApplicationToast` は改名しない。** Djangoテンプレート / 素のJSから呼ぶ実行時契約で、型で守られない。グローバルは名前空間を持つ方が正しい。同じ理由で `"application-form-success"`（HX-Triggerイベント名）、`.application-form-dialog-body`、`application-radio-*` のid接頭辞も据え置く。

## 理由

検討した代替案は次の4つです。

| 案 | 内容 | 判断 |
|---|---|---|
| A | 接頭辞を完全に撤廃する | 採用 |
| B | `App*` へ短縮する | 却下 |
| C | 現状維持 | 却下 |
| D | 無印を正とし、旧名を恒久aliasとして残す | 部分採用 |

案Bは「shadcn/ui由来か自前かを名前で見分ける価値がある」ことを前提にしていました。コンテキストの3でその前提が成り立たないことが分かったため、短くはなるが意味を持たない接頭辞が残るだけになります。

案Cは読みやすさの問題を放置するだけでなく、コンテキストの4の破壊的改名を将来にわたって繰り返します。

案Dの「旧名を恒久的に残す」は却下しましたが、移行期間だけ残す形（決定の4）を採りました。利用側の実測は約1,255箇所・232ファイルで、一括では移行できません。利用側はいずれも `^5.1.x` 固定なのでcaretがmajorを跨がず、v6.2.0を非破壊にしておけば各Applicationの都合で移行できます。

案Aを採ると `FieldSet` が唯一のbuildが壊れる衝突になります。これは改名の副作用ではなく、shadcn/uiの合成API版とこのrepositoryのprops API版が本当に同じ名前を欲しがっていた、という元からの重複が露出したものです。片方を選ぶ判断を先に済ませました。

## 結果

- JSXが短くなり、shadcn/uiのドキュメント・エコシステムと語彙が一致する。人もAI agentも `Button` を探して見つけられる。
- 昇格/降格が非破壊になる。`Card` を再exportからwrapperへ移しても、利用側のimportはそのまま動く。
- index.tsのsectionとJSDocが由来の唯一の情報源になる。**名前で判断できなくなるため、sectionの整理を怠ると由来が分からなくなる。** exportを追加するときは必ず正しいsectionへ置くこと。
- 型名の一部がshadcn/uiのComponent名と同名になる（`SelectItem` / `ComboboxItem` / `RadioGroupItem`）。TypeScriptは値と型を別の名前空間で扱うため衝突しないが、読み手が混同しうる。これらを `components/ui/` から公開APIへ昇格させる場合は名前を再検討する。
- wrapper内部で `components/ui/` のprimitiveを `*Primitive` エイリアスでimportする必要が出た（12ファイル）。wrapperを追加するときも同じ形になる。
- 制約として、v7.0.0まで `legacy-names.ts` の二重語彙が残る。

## 見直し

v7.0.0で旧名を削除した時点でこのADRの移行部分は役目を終える。以後「由来を名前に持たせない」という決定だけが残る。

`components/ui/` のprimitiveを公開APIへ広く昇格させる方針に変わった場合、無印の名前空間が primitive と wrapper で競合するため、そのときにこのADRを見直す。
