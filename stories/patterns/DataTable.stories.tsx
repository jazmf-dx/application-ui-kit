import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, MoreVertical, Pencil, Plus, Search, Trash, X } from "lucide-react";
import * as React from "react";
import {
  Button,
  Checkbox,
  ConfirmDialog,
  Dropdown,
  Input,
  Select,
  Table,
  type TableColumn,
  toast,
} from "../../components/application";

/**
 * 一覧画面の組み立て方。
 *
 * <important>
 * `Table` は**表を描くだけ**。検索・絞り込み・並び替え・ページングは業務ロジックなので
 * 画面側で実装し、結果を `rows` に渡す。ここではその「画面側」の書き方を示す。
 * </important>
 */
const meta = {
  title: "パターン/一覧表",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

一覧画面の構造を固定する。上から順に:

\`\`\`
1. 見出し + 主アクション（新規作成）      ← 右上に primary ボタン
2. 検索・絞り込み                          ← 表の「上」に置く
3. 選択中の件数 + 一括操作                 ← 選択があるときだけ表示
4. Table                                 ← 表本体（空状態は必ず設定）
5. 件数表示 + ページング                   ← 表の「下」
\`\`\`

| 決めごと | ルール |
|---|---|
| 主アクション | 見出しの右。\`Button variant="primary"\` + \`leftIcon\` |
| 検索欄 | 表の上。\`Input leftIcon={<Search />}\`。**ラベルは置かず \`aria-label\` を付ける** |
| 絞り込みの解除 | 条件が付いているときだけ「クリア」を出す |
| 一括操作 | 表の**上**に置く（下だとスクロールで見えなくなる） |
| 行アクション | 右端の \`Dropdown\`。3 つ以上ならメニューに畳む |
| 削除 | \`Dropdown\` から直接実行せず \`ConfirmDialog\` を経由 |
| 空状態 | \`emptyMessage\` 必須。**「条件に一致しない」と「1 件もない」を書き分ける** |
| 数値列 | \`align: 'right'\` + \`toLocaleString()\` |
| モバイル | 重要でない列に \`hidden md:table-cell\` を付けて落とす |

## 使う場面

- React コンポーネントで一覧を持つ画面（絞り込みを JS で完結させたい場合）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| **サーバーレンダリングの一覧画面** | テンプレートの \`{% for %}\` で描画。これが既定。Foundations の「テーブル」を参照 |
| 数百行以上 | サーバー側ページング。全行を描画すると重い |
| 項目が 2〜3 個で縦に読ませたい | 定義リスト（\`<dl>\`）かカードのリスト |
| 表計算のような編集 | Table の範囲外。専用 UI を検討する |

## 注意事項

- **絞り込みは「0 件になった理由」を伝える。**
  条件に一致しないのか、そもそも 1 件もないのかで
  \`emptyMessage\` を書き分ける（Story の \`WithFiltering\` を参照）
- **\`rowKey\` を必ず渡す。** 絞り込みで行が入れ替わると
  index ベースの key では表示が壊れる
- **一括操作のボタンは、選択が 0 件のとき \`disabled\`** にする。
  押せるのに何も起きない状態を作らない
- **行全体をクリックできるようにするだけで済ませない。**
  \`<tr>\` はキーボードでフォーカスできないため、行内にリンクを置く
- 件数は必ず表示する。「何件あるか」が分からない一覧は信頼されない
- 絞り込み条件は URL に反映させる（実アプリでは \`?status=new\` 等）。
  ページを共有・再読み込みできなくなるのを防ぐ
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Status = "new" | "in_progress" | "done";

type Request = {
  id: number;
  code: string;
  title: string;
  status: Status;
  applicant: string;
  department: string;
  amount: number;
  locked: boolean;
};

const STATUS_LABEL: Record<Status, { label: string; cls: string }> = {
  new: { label: "未対応", cls: "bg-yellow-50 text-yellow-600" },
  in_progress: { label: "対応中", cls: "bg-sky-50 text-sky-500" },
  done: { label: "完了", cls: "bg-emerald-50 text-emerald-600" },
};

const ALL_ROWS: Request[] = [
  {
    id: 1,
    code: "SYS-2026-0001",
    title: "備品購入（モニター 2 台）",
    status: "new",
    applicant: "山田 太郎",
    department: "開発部",
    amount: 78000,
    locked: false,
  },
  {
    id: 2,
    code: "SYS-2026-0002",
    title: "出張費精算（大阪）",
    status: "in_progress",
    applicant: "鈴木 花子",
    department: "営業部",
    amount: 45800,
    locked: false,
  },
  {
    id: 3,
    code: "SYS-2026-0003",
    title: "書籍購入",
    status: "done",
    applicant: "佐藤 次郎",
    department: "開発部",
    amount: 3200,
    locked: true,
  },
  {
    id: 4,
    code: "SYS-2026-0004",
    title: "研修参加費",
    status: "done",
    applicant: "田中 三郎",
    department: "総務部",
    amount: 120000,
    locked: true,
  },
  {
    id: 5,
    code: "SYS-2026-0005",
    title: "名刺の追加発注",
    status: "new",
    applicant: "高橋 良子",
    department: "営業部",
    amount: 8600,
    locked: false,
  },
  {
    id: 6,
    code: "SYS-2026-0006",
    title: "検査治具の製作",
    status: "in_progress",
    applicant: "伊藤 健一",
    department: "品質管理課",
    amount: 256000,
    locked: false,
  },
];

const STATUS_FILTER_ITEMS = [
  { value: "all", label: "すべて" },
  { value: "new", label: "未対応" },
  { value: "in_progress", label: "対応中" },
  { value: "done", label: "完了" },
];

/** 基本の列定義。数値列は右寄せ + `toLocaleString()`。 */
function baseColumns(): TableColumn<Request>[] {
  return [
    {
      key: "code",
      header: "申請番号",
      className: "w-40 hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
    },
    {
      key: "title",
      header: "件名",
      cell: (r) => (
        <a
          href="#"
          className="text-primary underline-offset-2 hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          {r.title}
        </a>
      ),
    },
    {
      key: "status",
      header: "ステータス",
      className: "w-28",
      cell: (r) => (
        <span className={`badge ${STATUS_LABEL[r.status].cls}`}>
          {STATUS_LABEL[r.status].label}
        </span>
      ),
    },
    {
      key: "applicant",
      header: "申請者",
      className: "w-32 hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (r) => r.applicant,
    },
    {
      key: "amount",
      header: "金額",
      align: "right",
      className: "w-28",
      cell: (r) => `${r.amount.toLocaleString()} 円`,
    },
  ];
}

/** 行アクション列（メニュー + 削除確認）。 */
function actionColumn(onDelete: (row: Request) => void): TableColumn<Request> {
  return {
    key: "actions",
    header: <span className="sr-only">操作</span>,
    align: "right",
    className: "w-12",
    cell: (row) => (
      <Dropdown
        label={row.code}
        trigger={
          <Button variant="ghost" size="icon" aria-label={`${row.title} の操作メニュー`}>
            <MoreVertical />
          </Button>
        }
        items={[
          { key: "edit", label: "編集", icon: <Pencil /> },
          { key: "duplicate", label: "複製", icon: <Copy /> },
          {
            key: "delete",
            label: row.locked ? "削除（完了済みのため不可）" : "削除",
            icon: <Trash />,
            danger: true,
            disabled: row.locked,
            separatorBefore: true,
            // ✓ 直接消さず確認ダイアログを開く
            onSelect: () => onDelete(row),
          },
        ]}
      />
    ),
  };
}

/**
 * 最小構成。
 *
 * 見出し + 主アクション + 表 + 件数。
 * 絞り込みが不要な一覧はここまでで十分。
 */
export const Basic: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">申請一覧</h2>
        <Button variant="primary" leftIcon={<Plus />}>
          新規申請
        </Button>
      </div>

      <Table<Request>
        columns={baseColumns()}
        rows={ALL_ROWS}
        rowKey={(r) => r.id}
        caption="申請の一覧"
        emptyMessage="申請がありません"
        emptySubMessage="「新規申請」から作成してください"
      />

      <p className="text-sm text-muted-foreground">全 {ALL_ROWS.length} 件</p>
    </div>
  ),
};

/**
 * 検索・絞り込み付き。
 *
 * 検索欄とセレクトは**表の上**。条件が付いているときだけ「クリア」を出す。
 * `emptyMessage` を「絞り込み中」と「1 件もない」で**書き分けている**のが要点。
 */
export const WithFiltering: Story = {
  render: () => {
    const [keyword, setKeyword] = React.useState("");
    const [status, setStatus] = React.useState("all");

    const filtered = ALL_ROWS.filter((r) => {
      const matchKeyword =
        !keyword ||
        r.title.includes(keyword) ||
        r.code.toLowerCase().includes(keyword.toLowerCase()) ||
        r.applicant.includes(keyword);
      const matchStatus = status === "all" || r.status === status;
      return matchKeyword && matchStatus;
    });

    const isFiltered = keyword !== "" || status !== "all";

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">申請一覧</h2>
          <Button variant="primary" leftIcon={<Plus />}>
            新規申請
          </Button>
        </div>

        {/* 絞り込み: 表の上に置く */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-72">
            <Input
              // 検索欄はラベルを置かず aria-label で補う
              aria-label="申請を検索"
              placeholder="件名・申請番号・申請者で検索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              leftIcon={<Search />}
            />
          </div>
          <div className="sm:w-40">
            <Select
              aria-label="ステータスで絞り込み"
              items={STATUS_FILTER_ITEMS}
              value={status}
              onValueChange={setStatus}
            />
          </div>
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<X />}
              onClick={() => {
                setKeyword("");
                setStatus("all");
              }}
            >
              クリア
            </Button>
          )}
        </div>

        <Table<Request>
          columns={baseColumns()}
          rows={filtered}
          rowKey={(r) => r.id}
          caption="申請の一覧"
          // ✓ 「条件に一致しない」と「1 件もない」を書き分ける
          emptyMessage={isFiltered ? "条件に一致する申請がありません" : "申請がありません"}
          emptySubMessage={
            isFiltered ? "検索条件を変えてお試しください" : "「新規申請」から作成してください"
          }
        />

        <p className="text-sm text-muted-foreground">
          {isFiltered
            ? `${filtered.length} 件（全 ${ALL_ROWS.length} 件中）`
            : `全 ${ALL_ROWS.length} 件`}
        </p>
      </div>
    );
  },
};

/**
 * 行アクション + 削除確認 + 一括操作。
 *
 * 実アプリの一覧画面に最も近い形。
 *
 * - 一括操作は**表の上**（下だとスクロールで見えなくなる）
 * - 0 件選択時は一括削除を `disabled`
 * - 削除は `Dropdown` から直接実行せず `ConfirmDialog` を経由
 * - 完了済みの行は削除を `disabled`（押せるのに失敗する状態を作らない）
 */
export const WithActionsAndSelection: Story = {
  render: () => {
    const [rows, setRows] = React.useState<Request[]>(ALL_ROWS);
    const [selected, setSelected] = React.useState<number[]>([]);
    const [target, setTarget] = React.useState<Request | null>(null);
    const [bulkOpen, setBulkOpen] = React.useState(false);

    const deletable = rows.filter((r) => !r.locked);
    const allChecked = deletable.length > 0 && selected.length === deletable.length;
    const someChecked = selected.length > 0 && !allChecked;

    const columns: TableColumn<Request>[] = [
      {
        key: "select",
        className: "w-10",
        header: (
          <Checkbox
            aria-label="選択可能な行をすべて選択"
            checked={allChecked}
            indeterminate={someChecked}
            onCheckedChange={(checked) => setSelected(checked ? deletable.map((r) => r.id) : [])}
          />
        ),
        cell: (row) =>
          row.locked ? (
            // 操作できない行はチェックボックスを出さない
            <span className="sr-only">選択できません</span>
          ) : (
            <Checkbox
              aria-label={`${row.title} を選択`}
              checked={selected.includes(row.id)}
              onCheckedChange={(checked) =>
                setSelected((prev) =>
                  checked ? [...prev, row.id] : prev.filter((id) => id !== row.id),
                )
              }
            />
          ),
      },
      ...baseColumns(),
      actionColumn((row) => setTarget(row)),
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">申請一覧</h2>
          <Button variant="primary" leftIcon={<Plus />}>
            新規申請
          </Button>
        </div>

        {/* 一括操作: 表の上 */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {selected.length > 0
              ? `${selected.length} 件を選択中`
              : "行を選択すると一括操作できます"}
          </p>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash />}
            disabled={selected.length === 0}
            onClick={() => setBulkOpen(true)}
          >
            一括削除
          </Button>
        </div>

        <Table<Request>
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          caption="申請の一覧（選択可能）"
          emptyMessage="申請がありません"
          emptySubMessage="「新規申請」から作成してください"
        />

        <p className="text-sm text-muted-foreground">全 {rows.length} 件</p>

        {/* 単体削除 */}
        <ConfirmDialog
          open={target !== null}
          onOpenChange={(next) => !next && setTarget(null)}
          type="danger"
          title="削除確認"
          message={`申請「${target?.title ?? ""}」を削除しますか？`}
          detail="削除すると元に戻せません。"
          confirmText="削除"
          onConfirm={async () => {
            await new Promise((resolve) => window.setTimeout(resolve, 600));
            setRows((prev) => prev.filter((r) => r.id !== target?.id));
            setSelected((prev) => prev.filter((id) => id !== target?.id));
            setTarget(null);
            toast.success("削除しました");
          }}
        />

        {/* 一括削除: 件数を明示する */}
        <ConfirmDialog
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          type="danger"
          title="一括削除の確認"
          message={`選択した ${selected.length} 件の申請を削除しますか？`}
          detail="削除すると元に戻せません。"
          confirmText={`${selected.length} 件を削除`}
          onConfirm={async () => {
            await new Promise((resolve) => window.setTimeout(resolve, 800));
            const count = selected.length;
            setRows((prev) => prev.filter((r) => !selected.includes(r.id)));
            setSelected([]);
            // ✓ 1 件ごとに出さず、まとめて 1 回
            toast.success(`${count} 件を削除しました`);
          }}
        />
      </div>
    );
  },
};

/**
 * 並び替えとページング。
 *
 * **どちらも `Table` は持っていない。** 画面側で計算し、結果を `rows` に渡す。
 * ヘッダーは `<button>` にして、現在の並び順を `aria-sort` で伝える。
 *
 * 実アプリでは並び順・ページ番号を URL（`?sort=amount&page=2`）に反映させる。
 */
export const WithSortingAndPaging: Story = {
  render: () => {
    const PER_PAGE = 3;
    type SortKey = "code" | "amount";

    const [sortKey, setSortKey] = React.useState<SortKey>("code");
    const [asc, setAsc] = React.useState(true);
    const [page, setPage] = React.useState(1);

    const sorted = [...ALL_ROWS].sort((a, b) => {
      const diff = sortKey === "amount" ? a.amount - b.amount : a.code.localeCompare(b.code);
      return asc ? diff : -diff;
    });

    const totalPages = Math.ceil(sorted.length / PER_PAGE);
    const current = Math.min(page, totalPages);
    const pageRows = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE);

    const toggleSort = (key: SortKey) => {
      if (key === sortKey) setAsc((prev) => !prev);
      else {
        setSortKey(key);
        setAsc(true);
      }
      setPage(1);
    };

    /**
     * 並び替えボタン付きのヘッダー。
     *
     * Table は `<th>` に `aria-sort` を付ける手段を持たないため、
     * 現在の並び順はボタンの `aria-label` に文字で含めて伝える。
     */
    const sortHeader = (key: SortKey, label: string) => {
      const active = sortKey === key;
      const order = active ? (asc ? "昇順" : "降順") : "未指定";
      return (
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className="inline-flex items-center gap-1 hover:text-foreground"
          aria-label={`${label} で並び替え（現在: ${order}）`}
        >
          {label}
          <span aria-hidden="true" className="text-xs">
            {active ? (asc ? "▲" : "▼") : "↕"}
          </span>
        </button>
      );
    };

    const columns: TableColumn<Request>[] = [
      {
        key: "code",
        header: sortHeader("code", "申請番号"),
        className: "w-40",
        cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
      },
      { key: "title", header: "件名", cell: (r) => r.title },
      {
        key: "status",
        header: "ステータス",
        className: "w-28",
        cell: (r) => (
          <span className={`badge ${STATUS_LABEL[r.status].cls}`}>
            {STATUS_LABEL[r.status].label}
          </span>
        ),
      },
      {
        key: "amount",
        header: sortHeader("amount", "金額"),
        align: "right",
        className: "w-28",
        cell: (r) => `${r.amount.toLocaleString()} 円`,
      },
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">申請一覧</h2>

        <Table<Request>
          columns={columns}
          rows={pageRows}
          rowKey={(r) => r.id}
          caption="申請の一覧（並び替え・ページング付き）"
          emptyMessage="申請がありません"
        />

        {/* 件数とページング: 表の下 */}
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            全 {sorted.length} 件中 {(current - 1) * PER_PAGE + 1}〜
            {Math.min(current * PER_PAGE, sorted.length)} 件を表示
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              前へ
            </Button>
            <span className="text-sm text-muted-foreground">
              {current} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
            >
              次へ
            </Button>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * モバイル表示。
 *
 * 申請番号（`hidden md:table-cell`）と申請者（`hidden lg:table-cell`）が落ち、
 * 件名・ステータス・金額だけが残る。
 * **横スクロールに頼るより、画面幅に応じて情報を落とす。**
 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-foreground">申請一覧</h2>
        <Button variant="primary" size="sm" leftIcon={<Plus />}>
          新規
        </Button>
      </div>

      <Input
        aria-label="申請を検索"
        placeholder="検索"
        leftIcon={<Search />}
      />

      <Table<Request>
        columns={baseColumns()}
        rows={ALL_ROWS}
        rowKey={(r) => r.id}
        caption="申請の一覧"
        emptyMessage="申請がありません"
      />

      <p className="text-sm text-muted-foreground">全 {ALL_ROWS.length} 件</p>
    </div>
  ),
};
