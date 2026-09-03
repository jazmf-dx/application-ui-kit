# ADR-0003: ドメインUIとUI Platformの境界

**ステータス**: 提案中

## コンテキスト

[Application UI Standard §6](https://github.com/hamirilo/ai-dev-standards/blob/main/standards/application-ui/README.md) は、社員・組織・拠点等の業務domainに意味を持つUIをdomain所有projectで管理し、UI Platformへ置かないと定めます。同時に `DatePicker` / `DataTable` 等の汎用UIはDomain Componentとして扱わないとも定めます。

実装時にこの2つの間で判断が繰り返し止まりました。「部署を選ぶUI」は§6が禁じるDomain Componentですが、「階層から1つ選ぶUI」は汎用UIです。両者は同じ画面を指しており、名前が業務語彙かどうかでは分けられません。

判断基準が無いことで、両方向の失敗が起きています。

- UI Platformにある汎用UIをApplicationが自前実装し、同じ実装が複数repositoryへ重複した
- 汎用化できるUIを「業務domainに見える」という理由だけでApplication側へ残した

## 決定

UI Platformへ置けるかどうかを、名前ではなく **ドメイン連携を内部に持つか** で判断します。

1. ドメイン連携（マスタ取得、認証、CSRF、endpoint設定）を内部に持たず、必要なデータをpropsで受け取るcomponentはUI Platformへ置く。
2. ドメイン連携を内部に持つcomponentはUI Platformへ置かない。domainを所有するprojectが持ち、他Applicationへは連携境界で提供する。
3. Applicationは汎用UIを自前で実装しない。UI Platformに無ければUI Platformへ追加する。

結果としてdomain UIは2層になります。UI Platformの汎用componentと、それへデータを渡すdomain所有project側の薄いwrapperです。

## 理由

検討した代替案は次の3つです。

| 案 | 内容 | 判断 |
|---|---|---|
| A | 業務語彙を名前に持つUIを一律でUI Platformから排除する | 却下 |
| B | Domain ComponentもUI Platformから配布する | 却下 |
| C | ドメイン連携を内部に持つかで分ける | 採用 |

案Aは名前を基準にするため、`TreeSelect` のような業務domainを持たない実装まで各projectへ散ります。重複を止められません。

案Bは§6が明示的に禁じます。componentへ認証・CSRF・endpointを焼き込んで配布すると、利用側すべてがそのdomain連携を引き受けることになります。

案Cは§6の趣旨（domain連携を共有UIへ焼き込まない）をそのまま基準にしたものです。名前ではなく依存で分けるため、判断が実装者によってぶれません。

## 結果

- UI Platformは業務domainを知らないまま、階層選択のような複雑なUIを引き受けられる。最初の適用が `TreeSelect` である。
- domain所有projectはwrapperの分だけcodeを持つが、見た目・Token・a11yの更新はUI Platform側の1箇所で済む。
- 「UI Platformに置くか」の議論が、componentが何をimportしているかの確認に変わる。
- 制約として、propsで渡す形へ落とせないUI（サーバー側の検索を前提とする無限スクロール等）はこの分割ができない。その場合はdomain所有projectが全体を持つ。

## 見直し

案Cで分割できないUIが複数projectで繰り返し必要になった場合、データ取得を抽象化したうえでUI Platformへ置けるかを再検討します。
