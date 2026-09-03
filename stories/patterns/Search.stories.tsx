import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchX } from "lucide-react";
import * as React from "react";
import {
  Badge,
  Button,
  SearchInput,
  Select,
  Table,
  type TableColumn,
  Card,
  CardContent,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Spinner,
} from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * 一覧の絞り込み（キーワード検索）の組み立て方。
 *
 * <important>
 * 検索欄・件数・結果は**同じ場所に留める**。
 * 検索中や 0 件のときに検索欄が消えたり位置が動いたりすると、
 * 条件を直せずに詰まる。
 * </important>
 */
const meta = {
  title: "Patterns/Search",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

一覧の絞り込みで毎回決め直しているものを固定する。

| 決めごと | ルール |
|---|---|
| 検索欄の位置 | 一覧の**上**。結果が変わっても位置を動かさない |
| 件数の表示 | 検索欄の隣に「N 件」。0 件でも消さない |
| 検索中 | 結果領域だけを差し替える。**検索欄は操作できるまま**にする |
| 0 件 | \`Patterns/EmptyState\` の「検索結果 0 件」。条件のクリア手段を置く |
| クリア | \`onClear\` を渡す（値があるときだけ × が出る） |
| 絞り込みの併用 | キーワード + \`Select\`。選択中の条件は結果の上に出す |
| 探す対象が一覧の外にもある | 一覧の絞り込みではなく \`ScopeSearch\`（種別横断）を検討する |

## 使う場面

- 一覧・テーブルのキーワード絞り込み
- 検索条件を複数持つ一覧画面

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 候補から 1 つ選ぶ（社員・取引先など） | \`Combobox\` |
| 選択肢が固定の絞り込みだけ | \`Select\` 単体。検索欄は要らない |
| 全画面横断の検索（人も組織も探す） | \`ScopeSearch\`。画面上部の共通検索はこちら |

## 注意事項

- **検索中に検索欄を無効化しない。** 入力し直せなくなる
- **0 件でも検索欄と件数を残す。** 何で検索したのかが分からなくなる
- 入力の都度リクエストを投げる場合は debounce する（実装側の責務）
- 件数は「N 件」と数字で出す。「見つかりました」だけでは何件か分からない
- 検索対象を明示する（\`placeholder\` に「件名で検索」のように書く）
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Request = {
  id: number;
  code: string;
  title: string;
  applicant: string;
  status: "new" | "active" | "done";
};

const STATUS_LABEL: Record<Request["status"], string> = {
  new: "未対応",
  active: "対応中",
  done: "完了",
};

const ROWS: Request[] = [
  { id: 1, code: "SYS-2026-0001", title: "備品購入（モニター 2 台）", applicant: "山田 太郎", status: "new" },
  { id: 2, code: "SYS-2026-0002", title: "出張費精算（大阪）", applicant: "佐藤 花子", status: "active" },
  { id: 3, code: "SYS-2026-0003", title: "書籍購入", applicant: "鈴木 一郎", status: "done" },
  { id: 4, code: "SYS-2026-0004", title: "研修参加費", applicant: "田中 次郎", status: "active" },
  { id: 5, code: "SYS-2026-0005", title: "名刺の追加発注", applicant: "山田 太郎", status: "done" },
];

const COLUMNS: TableColumn<Request>[] = [
  { key: "code", header: "申請番号", className: "w-36", cell: (r) => r.code },
  { key: "title", header: "件名", cell: (r) => r.title },
  { key: "applicant", header: "申請者", className: "w-32", cell: (r) => r.applicant },
  {
    key: "status",
    header: "ステータス",
    className: "w-28",
    cell: (r) => <Badge tone={r.status}>{STATUS_LABEL[r.status]}</Badge>,
  },
];

const STATUS_ITEMS = [
  { value: "all", label: "すべて" },
  { value: "new", label: "未対応" },
  { value: "active", label: "対応中" },
  { value: "done", label: "完了" },
];

/** 検索欄・件数・結果の 3 つの状態を 1 画面で比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase className="max-w-none">
      <Section title="Default" note="検索欄は一覧の上。件数は検索欄の隣に置く。">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="max-w-xs flex-1">
              <SearchInput placeholder="件名で検索" aria-label="件名で検索" />
            </div>
            <span className="text-xs text-muted-foreground">{ROWS.length} 件</span>
          </div>
          <Table<Request>
            columns={COLUMNS}
            rows={ROWS.slice(0, 3)}
            rowKey={(r) => r.id}
            caption="申請の一覧"
          />
        </div>
      </Section>

      <Section title="Searching" note="結果領域だけを差し替える。検索欄は操作できるままにする。">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="max-w-xs flex-1">
              <SearchInput
                defaultValue="備品"
                placeholder="件名で検索"
                aria-label="件名で検索（検索中）"
              />
            </div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Spinner className="size-3" />
              検索中...
            </span>
          </div>
          <div className="flex items-center justify-center rounded-xl border border-border bg-card py-10">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              検索中...
            </span>
          </div>
        </div>
      </Section>

      <Section title="No Results" note="0 件でも検索欄と件数を残す。条件のクリア手段を置く。">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="max-w-xs flex-1">
              <SearchInput
                defaultValue="モニター 3 台"
                placeholder="件名で検索"
                aria-label="件名で検索（0 件）"
              />
            </div>
            <span className="text-xs text-muted-foreground">0 件</span>
          </div>
          <Card>
            <CardContent>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchX />
                  </EmptyMedia>
                  <EmptyTitle>条件に一致する申請がありません</EmptyTitle>
                  <EmptyDescription>条件を変えて検索してください。</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="secondary">検索条件をクリア</Button>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Showcase>
  ),
};

/**
 * 基本形。実際に絞り込める。
 *
 * 件名・申請番号・申請者のいずれかに一致すれば残す。
 * 実装では検索対象をサーバー側と揃えること（見えている列以外も対象にするなら明示する）。
 */
export const Default: Story = {
  render: () => {
    const [keyword, setKeyword] = React.useState("");
    const normalized = keyword.trim().toLowerCase();
    const rows = normalized
      ? ROWS.filter((r) =>
          [r.title, r.code, r.applicant].some((v) => v.toLowerCase().includes(normalized)),
        )
      : ROWS;

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="max-w-xs flex-1">
            <SearchInput
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onClear={() => setKeyword("")}
              placeholder="件名・申請番号・申請者で検索"
              aria-label="申請を検索"
            />
          </div>
          <span className="text-xs text-muted-foreground">{rows.length} 件</span>
        </div>

        {rows.length > 0 ? (
          <Table<Request>
            columns={COLUMNS}
            rows={rows}
            rowKey={(r) => r.id}
            caption="申請の一覧"
          />
        ) : (
          <Card>
            <CardContent>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchX />
                  </EmptyMedia>
                  <EmptyTitle>条件に一致する申請がありません</EmptyTitle>
                  <EmptyDescription>
                    「{keyword}」を含む申請は見つかりませんでした。
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="secondary" onClick={() => setKeyword("")}>
                    検索条件をクリア
                  </Button>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        )}
      </div>
    );
  },
};

/**
 * 検索中。
 *
 * **検索欄は操作できるまま**にし、結果領域だけを差し替える。
 * 押すと 1.2 秒後に結果が返る。
 */
export const Searching: Story = {
  render: () => {
    const [keyword, setKeyword] = React.useState("備品");
    const [searching, setSearching] = React.useState(true);

    React.useEffect(() => {
      if (!searching) return;
      const timer = window.setTimeout(() => setSearching(false), 1200);
      return () => window.clearTimeout(timer);
    }, [searching]);

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="max-w-xs flex-1">
            <SearchInput
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setSearching(true);
              }}
              onClear={() => {
                setKeyword("");
                setSearching(true);
              }}
              placeholder="件名で検索"
              aria-label="件名で検索"
            />
          </div>
          {searching ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Spinner className="size-3" />
              検索中...
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">1 件</span>
          )}
        </div>

        {searching ? (
          <div className="flex items-center justify-center rounded-xl border border-border bg-card py-10">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              検索中...
            </span>
          </div>
        ) : (
          <Table<Request>
            columns={COLUMNS}
            rows={ROWS.slice(0, 1)}
            rowKey={(r) => r.id}
            caption="申請の一覧（検索結果）"
          />
        )}
      </div>
    );
  },
};

/**
 * 検索結果が 0 件。
 *
 * 検索欄と件数を残したまま、結果領域だけを空状態にする。
 * **作成を促すのではなく、条件の見直しを促す**（Patterns/EmptyState を参照）。
 */
export const NoResults: Story = {
  render: () => {
    const [keyword, setKeyword] = React.useState("モニター 3 台");

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="max-w-xs flex-1">
            <SearchInput
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onClear={() => setKeyword("")}
              placeholder="件名で検索"
              aria-label="件名で検索"
            />
          </div>
          <span className="text-xs text-muted-foreground">0 件</span>
        </div>

        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>条件に一致する申請がありません</EmptyTitle>
                <EmptyDescription>
                  {keyword ? `「${keyword}」` : "指定された条件"}
                  を含む申請は見つかりませんでした。条件を変えて検索してください。
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary" onClick={() => setKeyword("")}>
                  検索条件をクリア
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  },
};

/**
 * キーワードと絞り込みの併用。
 *
 * 選択中の条件は**結果の上に出す**。ツールバーの中だけに置くと、
 * スクロールした先で「なぜ件数が少ないのか」が分からなくなる。
 */
export const WithFilters: Story = {
  render: () => {
    const [keyword, setKeyword] = React.useState("");
    const [status, setStatus] = React.useState("active");

    const normalized = keyword.trim().toLowerCase();
    const rows = ROWS.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (!normalized ||
          [r.title, r.code, r.applicant].some((v) => v.toLowerCase().includes(normalized))),
    );
    const filtered = status !== "all" || normalized !== "";

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="max-w-xs flex-1">
            <SearchInput
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onClear={() => setKeyword("")}
              placeholder="件名・申請番号・申請者で検索"
              aria-label="申請を検索"
            />
          </div>
          <div className="w-40">
            <Select
              items={STATUS_ITEMS}
              value={status}
              onValueChange={setStatus}
              aria-label="ステータスで絞り込み"
            />
          </div>
          <span className="text-xs text-muted-foreground">{rows.length} 件</span>
        </div>

        {filtered && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>絞り込み中:</span>
            {status !== "all" && (
              <Badge tone="neutral">
                ステータス: {STATUS_ITEMS.find((i) => i.value === status)?.label}
              </Badge>
            )}
            {normalized !== "" && <Badge tone="neutral">キーワード: {keyword}</Badge>}
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setKeyword("");
                setStatus("all");
              }}
            >
              条件をクリア
            </Button>
          </div>
        )}

        <Table<Request>
          columns={COLUMNS}
          rows={rows}
          rowKey={(r) => r.id}
          emptyMessage="条件に一致する申請がありません"
          emptySubMessage="条件を変えて検索してください"
          caption="申請の一覧（絞り込み結果）"
        />
      </div>
    );
  },
};
