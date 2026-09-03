import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText, Inbox, Lock, Plus, SearchX } from "lucide-react";
import * as React from "react";
import {
  Button,
  SearchInput,
  Table,
  type TableColumn,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * データが 0 件のときの画面の組み立て方。
 *
 * <important>
 * 空状態は「何も表示しない」ことではない。
 * 何も出さないと、読み込み失敗なのかデータが無いのか利用者が判別できない。
 * **原因**と**次にできる操作**の 2 つを必ず置く。
 * </important>
 */
const meta = {
  title: "Patterns/EmptyState",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

0 件の画面で行き止まりを作らないようにする。
空状態の種類ごとに「何を書くか」を固定する。

| 種類 | 見出し | 次の操作 |
|---|---|---|
| まだ作られていない | 「まだ申請がありません」 | 作成ボタン（primary） |
| 検索・絞り込みの結果が 0 件 | 「条件に一致する申請がありません」 | 条件をクリアする操作 |
| 権限がない | 「閲覧権限がありません」 | 依頼先・申請方法の案内 |
| 読み込みに失敗した | 空状態ではない | Patterns/ErrorState を使う |

## 使う場面

- 一覧・検索結果・ダッシュボードのカードが 0 件のとき
- 初回利用時（データが 1 件もない状態）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 読み込み中 | スケルトンかスピナー。空状態を出すと「無い」と誤解される |
| 読み込みに失敗した | \`Patterns/ErrorState\`。原因と再試行手段が必要 |
| テーブルの 0 件 | \`Table\` の \`emptyMessage\` / \`emptySubMessage\`（外枠とヘッダーを保つ） |

## 注意事項

- **「データがありません」だけで終わらせない。** 次にできる操作を必ず添える
- **検索結果 0 件と、データ 0 件を同じ文言にしない。** 前者は条件を、後者は作成を促す
- 検索結果 0 件では**条件をクリアできる操作**を置く（何を検索したか忘れて詰まるため）
- 作成ボタンを置けない場面（権限がない等）では、**誰に依頼すればよいか**を書く
- アイコンは意味の補助。アイコンだけで状態を伝えない
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Request = { id: number; code: string; title: string; applicant: string };

const COLUMNS: TableColumn<Request>[] = [
  { key: "code", header: "申請番号", className: "w-36", cell: (r) => r.code },
  { key: "title", header: "件名", cell: (r) => r.title },
  { key: "applicant", header: "申請者", className: "w-32", cell: (r) => r.applicant },
];

/**
 * 4 種類の空状態を 1 画面で比較する。
 *
 * どれも「見出し」「説明」「次の操作」の 3 点で構成する。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="まだデータがない" note="作成を促す。primary のボタンを 1 つだけ置く。">
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox />
                </EmptyMedia>
                <EmptyTitle>まだ申請がありません</EmptyTitle>
                <EmptyDescription>
                  最初の申請を作成すると、ここに一覧が表示されます。
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button leftIcon={<Plus className="w-4 h-4" />}>新規申請</Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      </Section>

      <Section title="検索結果が 0 件" note="作成ではなく条件の見直しを促す。クリア手段を必ず置く。">
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>条件に一致する申請がありません</EmptyTitle>
                <EmptyDescription>
                  「モニター」を含む申請は見つかりませんでした。条件を変えて検索してください。
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary">検索条件をクリア</Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      </Section>

      <Section title="権限がない" note="操作できない理由と、誰に依頼すればよいかを書く。">
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Lock />
                </EmptyMedia>
                <EmptyTitle>閲覧権限がありません</EmptyTitle>
                <EmptyDescription>
                  この部署の申請を見るには承認者権限が必要です。所属部署の管理者に依頼してください。
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="テーブルの 0 件"
        note="外枠とヘッダーを残す。列が見えていれば、何の一覧なのかが分かる。"
      >
        <Table<Request>
          columns={COLUMNS}
          rows={[]}
          emptyMessage="申請がありません"
          emptySubMessage="「新規申請」から作成してください"
          caption="申請の一覧（0 件）"
        />
      </Section>
    </Showcase>
  ),
};

/**
 * データが 1 件もない状態。
 *
 * 初回利用時の画面。**作成ボタンを置く**ことで、次の操作が明確になる。
 */
export const NoData: Story = {
  render: () => (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>申請一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>まだ申請がありません</EmptyTitle>
            <EmptyDescription>
              最初の申請を作成すると、ここに一覧が表示されます。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button leftIcon={<Plus className="w-4 h-4" />}>新規申請</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  ),
};

/**
 * 検索・絞り込みの結果が 0 件。
 *
 * **検索欄を残したまま**空状態を出す。
 * 検索欄が消えると、何を検索したのか分からなくなり条件を直せない。
 */
export const NoSearchResults: Story = {
  render: () => {
    const [keyword, setKeyword] = React.useState("モニター");

    return (
      <div className="max-w-2xl space-y-4">
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
 * 操作を 2 つ置く場合。
 *
 * 主操作は primary 1 つだけ。補助操作（取り込み・ヘルプ）は secondary にする。
 * 3 つ以上並べると、どれを押すべきか判断できなくなる。
 */
export const WithAction: Story = {
  render: () => (
    <Card className="max-w-2xl">
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>取引先が登録されていません</EmptyTitle>
            <EmptyDescription>
              1 件ずつ登録するか、CSV でまとめて取り込めます。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button leftIcon={<Plus className="w-4 h-4" />}>取引先を登録</Button>
              <Button variant="secondary">CSV から取り込む</Button>
            </div>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  ),
};

/**
 * テーブルの 0 件。
 *
 * `Table` は `emptyMessage` を持つため、`Empty` を自分で組む必要はない。
 * ヘッダーが残るので「何の一覧が 0 件なのか」が伝わる。
 */
export const InTable: Story = {
  render: () => (
    <Table<Request>
      columns={COLUMNS}
      rows={[]}
      emptyMessage="申請がありません"
      emptySubMessage="「新規申請」から作成してください"
      caption="申請の一覧（0 件）"
    />
  ),
};
