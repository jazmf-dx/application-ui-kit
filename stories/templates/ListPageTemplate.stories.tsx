import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * 一覧画面（テンプレート版）。
 *
 * <important>
 * ここは **Django テンプレートへそのままコピーできる形** を示す見本。
 * React 部品を一切使わず、素の要素とテンプレート用クラス（tokens/classes.css）だけで組む。
 * htmx の属性（hx-get / hx-target / hx-trigger）も実際に書く位置に置いてある。
 * React で一覧を持つ画面は「パターン/一覧表」を見る。
 * </important>
 */
const meta = {
  title: "テンプレート/一覧画面（テンプレート版）",
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component: `
## 目的

Django Template + htmx で描く一覧画面の骨格を固定する（一覧画面 Standard「Django Template + htmx」の側）。
React 部品は使わず、テンプレート用クラスだけで組む。

\`\`\`
1. page-header      見出し + 主操作（右）
2. filter-bar       絞り込み（表の上）。change / input で hx-get、結果は表だけ差し替える
3. data-table       表本体。並び替えは th[aria-sort] のリンク（?sort=&dir=）
4. pagination       件数表記 + ページ送り（表の下）。?page= のリンク
\`\`\`

| 決めごと | ルール |
|---|---|
| 主操作 | 見出しの右（\`page-header-actions\`）。\`btn-primary\` は 1 つ |
| 絞り込み | 表の上の \`filter-bar\`。\`hx-trigger="change, input delay:400ms"\` で表だけ差し替える。条件は URL に載せる（\`hx-push-url\`） |
| 読み込み中 | \`htmx-indicator\` を filter-bar の右端に置く |
| 並び替え | 列見出しの \`<a>\`。\`aria-sort\` で向きを示し、サーバーが並び替える |
| 一括操作 | 表の**上**に置く（下だとスクロールで見えなくなる） |
| 0 件 | 「条件に一致しない」（条件を解除する導線）と「1 件もない」（作成の導線）を書き分ける |
| 件数 | 表の下の \`pagination-summary\`。ページ送りは \`?page=\` のリンク |

## 使う場面

- 検索条件を送って一覧を差し替えるだけの画面（client 側の複雑な state を持たない）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 入力に追従する絞り込み・行選択など client 側の state を持つ | React Island（パターン/一覧表） |
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ROWS = [
  { code: "SYS-2026-0001", title: "備品購入（モニター 2 台）", applicant: "山田 太郎", tone: "new", status: "未対応", amount: "78,000" },
  { code: "SYS-2026-0002", title: "出張費精算（大阪）", applicant: "鈴木 花子", tone: "active", status: "対応中", amount: "45,800" },
  { code: "SYS-2026-0003", title: "書籍購入", applicant: "佐藤 次郎", tone: "done", status: "完了", amount: "3,200" },
  { code: "SYS-2026-0004", title: "研修参加費", applicant: "田中 三郎", tone: "done", status: "完了", amount: "120,000" },
  { code: "SYS-2026-0005", title: "名刺の追加発注", applicant: "山田 太郎", tone: "pending", status: "保留", amount: "6,600" },
];

/** 一覧 + 絞り込み + 並び替え + ページ送り。すべてテンプレート用クラス。 */
export const Default: Story = {
  render: () => (
    <div className="sb-unstyled max-w-5xl">
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">申請一覧</h1>
            <p className="page-header-description">経費・備品の申請を確認し、対応状況を更新します</p>
          </div>
          <div className="page-header-actions">
            <a href="#" className="btn-secondary">
              CSV 出力
            </a>
            <a href="#" className="btn-primary">
              新規申請
            </a>
          </div>
        </div>
      </header>

      {/* hx-get で表（#request-table）だけを差し替える。条件は hx-push-url で URL に載せる */}
      <form
        className="filter-bar mb-4"
        method="get"
        data-hx-get="/requests/"
        data-hx-target="#request-table"
        data-hx-trigger="change, input delay:400ms"
        data-hx-push-url="true"
      >
        <label className="filter-bar-field">
          <span>キーワード</span>
          <input type="search" name="q" className="input-field" placeholder="件名・申請番号" />
        </label>
        <label className="filter-bar-field">
          <span>ステータス</span>
          <select name="status" className="input-field">
            <option value="">すべて</option>
            <option value="new">未対応</option>
            <option value="active">対応中</option>
            <option value="done">完了</option>
          </select>
        </label>
        <label className="filter-bar-field">
          <span>申請者</span>
          <select name="applicant" className="input-field">
            <option value="">すべて</option>
            <option>山田 太郎</option>
            <option>鈴木 花子</option>
          </select>
        </label>
        <a href="#" className="btn-secondary btn-sm">
          条件をクリア
        </a>
        <span className="htmx-indicator text-xs text-muted-foreground">読み込み中…</span>
      </form>

      <div id="request-table">
        <table className="data-table">
          <thead>
            <tr>
              <th aria-sort="ascending">
                <a href="#">申請番号</a>
              </th>
              <th aria-sort="none">
                <a href="#">件名</a>
              </th>
              <th>ステータス</th>
              <th aria-sort="none">
                <a href="#">申請者</a>
              </th>
              <th aria-sort="none" className="text-right">
                <a href="#">金額</a>
              </th>
              <th className="w-24">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.code}>
                <td className="font-mono text-xs">{r.code}</td>
                <td>
                  <a href="#" className="hover:underline">
                    {r.title}
                  </a>
                </td>
                <td>
                  <span className={`badge badge-${r.tone}`}>{r.status}</span>
                </td>
                <td>{r.applicant}</td>
                <td className="text-right tabular-nums">{r.amount} 円</td>
                <td className="text-right">
                  <a href="#" className="btn-secondary btn-xs">
                    編集
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <nav className="pagination mt-4" aria-label="ページネーション">
          <p className="pagination-summary">238 件中 1–20 件</p>
          <ul className="pagination-list">
            <li>
              <span className="pagination-item" aria-disabled="true">
                ‹
              </span>
            </li>
            <li>
              <span className="pagination-item" aria-current="page">
                1
              </span>
            </li>
            <li>
              <a className="pagination-item" href="#">
                2
              </a>
            </li>
            <li>
              <a className="pagination-item" href="#">
                3
              </a>
            </li>
            <li>
              <span className="pagination-ellipsis">…</span>
            </li>
            <li>
              <a className="pagination-item" href="#">
                12
              </a>
            </li>
            <li>
              <a className="pagination-item" href="#" aria-label="次のページ">
                ›
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  ),
};

/** 絞り込みの結果が 0 件。条件を解除する導線を出す（「1 件もない」とは書き分ける）。 */
export const FilteredEmpty: Story = {
  render: () => (
    <div className="sb-unstyled max-w-5xl">
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-header-title">申請一覧</h1>
          </div>
          <div className="page-header-actions">
            <a href="#" className="btn-primary">
              新規申請
            </a>
          </div>
        </div>
      </header>
      <form className="filter-bar mb-4">
        <label className="filter-bar-field">
          <span>キーワード</span>
          <input type="search" name="q" className="input-field" defaultValue="プロジェクター" />
        </label>
        <a href="#" className="btn-secondary btn-sm">
          条件をクリア
        </a>
      </form>
      <table className="data-table">
        <thead>
          <tr>
            <th>申請番号</th>
            <th>件名</th>
            <th>ステータス</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} className="py-12 text-center">
              <p className="text-sm font-medium">「プロジェクター」に一致する申請はありません</p>
              <p className="mt-1 text-sm text-muted-foreground">条件を変えるか、クリアしてすべての申請を表示してください</p>
              <a href="#" className="btn-secondary btn-sm mt-4">
                条件をクリア
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
