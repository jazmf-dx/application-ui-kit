import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, Lock, RefreshCw, ServerCrash } from "lucide-react";
import * as React from "react";
import {
  Badge,
  Button,
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
  Spinner,
} from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * 読み込み・通信が失敗したときの画面の組み立て方。
 *
 * <important>
 * エラー表示の目的は「謝ること」ではなく、**利用者が次の行動を選べること**。
 * 何が失敗したか・再試行できるか・できない場合はどこに問い合わせるかを必ず書く。
 * </important>
 */
const meta = {
  title: "Patterns/ErrorState",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

失敗の伝え方を固定する。**壊れた範囲だけを壊す**ことで、
1 か所の失敗が画面全体を使えなくしないようにする。

| 範囲 | 出し方 | 例 |
|---|---|---|
| 画面全体が表示できない | 画面中央に \`Empty\` + 再読み込み | 一覧の取得に失敗 |
| 一部だけ失敗した | そのカード・領域の中だけをエラーに置き換える | ダッシュボードの 1 枚 |
| 行・セル単位の失敗 | 該当行にバッジ・注記を出し、他の行は通常表示 | 一部レコードの集計失敗 |
| 入力内容の誤り | エラーではなく検証。\`FormField\` の \`error\` | 必須項目の未入力 |

## 使う場面

- API の取得・更新が失敗した
- 権限がなく取得できない（403）／対象が存在しない（404）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 入力内容の検証エラー | \`FormField\` の \`error\`（Patterns/Form の \`ValidationError\`） |
| データが 0 件 | \`Patterns/EmptyState\`。失敗ではない |
| 保存操作の失敗（画面は生きている） | \`toast\` の error + 画面内に状態を残す |

## 注意事項

- **再試行できるならボタンを置く。** 「再読み込みしてください」と文章で書くだけにしない
- **技術的なエラー文をそのまま出さない。** 何をすればよいか分かる文にし、
  問い合わせ用の識別子（リクエスト ID 等）だけを小さく添える
- **一部の失敗で画面全体をエラーにしない。** 動いている部分は使えるままにする
- **再試行が失敗し続ける場合の出口を用意する。** 問い合わせ先・ヘルプへの導線を置く
- エラー文は赤字だけに頼らない。アイコンと文章で伝える（色覚特性・屋外の視認性）
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Request = { id: number; code: string; title: string; amount: number | null };

const ROWS: Request[] = [
  { id: 1, code: "SYS-2026-0001", title: "備品購入（モニター 2 台）", amount: 68000 },
  { id: 2, code: "SYS-2026-0002", title: "出張費精算（大阪）", amount: null },
  { id: 3, code: "SYS-2026-0003", title: "書籍購入", amount: 4800 },
];

const COLUMNS: TableColumn<Request>[] = [
  { key: "code", header: "申請番号", className: "w-36", cell: (r) => r.code },
  { key: "title", header: "件名", cell: (r) => r.title },
  {
    key: "amount",
    header: "金額",
    align: "right",
    className: "w-32",
    cell: (r) =>
      r.amount === null ? (
        <Badge tone="warning">取得失敗</Badge>
      ) : (
        `${r.amount.toLocaleString()} 円`
      ),
  },
];

/** エラーの範囲ごとの出し方を 1 画面で比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="画面全体" note="再読み込みを主操作にする。問い合わせ用の識別子は小さく添える。">
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ServerCrash />
                </EmptyMedia>
                <EmptyTitle>申請一覧を読み込めませんでした</EmptyTitle>
                <EmptyDescription>
                  通信に失敗しました。しばらく待ってから再読み込みしてください。
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button leftIcon={<RefreshCw className="w-4 h-4" />}>
                  再読み込み
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">エラー ID: 8f21c0</p>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      </Section>

      <Section title="一部だけ失敗" note="失敗したカードだけを置き換える。他のカードは使えるままにする。">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>承認待ち</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">件</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>今月の申請金額</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0 text-danger" />
                <div className="space-y-2">
                  <p>集計を読み込めませんでした。</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    再試行
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="行・セル単位" note="失敗した値だけをバッジに置き換える。表そのものは読めるままにする。">
        <Table<Request>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          caption="申請の一覧（一部の金額が取得できていない）"
        />
      </Section>

      <Section title="権限・存在しない" note="再試行しても解決しないため、再読み込みボタンは置かない。">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Lock />
                  </EmptyMedia>
                  <EmptyTitle>閲覧権限がありません</EmptyTitle>
                  <EmptyDescription>
                    この申請を見るには承認者権限が必要です。所属部署の管理者に依頼してください。
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <AlertTriangle />
                  </EmptyMedia>
                  <EmptyTitle>申請が見つかりません</EmptyTitle>
                  <EmptyDescription>
                    削除されたか、URL が誤っている可能性があります。一覧から選び直してください。
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="secondary">申請一覧へ戻る</Button>
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
 * 画面全体が表示できない場合。
 *
 * 押すと再試行し、2 回目は成功する（実装では取得処理を呼び直す）。
 * **再試行中はボタンを `loading` にする。** 押したことが分からないと連打される。
 */
export const PageError: Story = {
  render: () => {
    const [retrying, setRetrying] = React.useState(false);
    const [recovered, setRecovered] = React.useState(false);

    if (recovered) {
      return (
        <Table<Request>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          caption="申請の一覧"
        />
      );
    }

    return (
      <Card className="max-w-2xl">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ServerCrash />
              </EmptyMedia>
              <EmptyTitle>申請一覧を読み込めませんでした</EmptyTitle>
              <EmptyDescription>
                通信に失敗しました。しばらく待ってから再読み込みしてください。
                解決しない場合は情報システム課に問い合わせてください。
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                loading={retrying}
                leftIcon={retrying ? undefined : <RefreshCw className="w-4 h-4" />}
                onClick={() => {
                  setRetrying(true);
                  window.setTimeout(() => {
                    setRetrying(false);
                    setRecovered(true);
                  }, 1200);
                }}
              >
                {retrying ? "再読み込み中..." : "再読み込み"}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">エラー ID: 8f21c0</p>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  },
};

/**
 * 一部だけ失敗した場合。
 *
 * ダッシュボードの 1 枚だけが失敗しても、他のカードは表示を続ける。
 * **画面全体をエラーにしない**ことが重要。
 */
export const PartialError: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false);
    const [value, setValue] = React.useState<number | null>(null);

    return (
      <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>承認待ち</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>差戻し</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今月の申請金額</CardTitle>
          </CardHeader>
          <CardContent>
            {value !== null ? (
              <>
                <p className="text-3xl font-semibold text-foreground">
                  {value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">円</p>
              </>
            ) : loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                <span>再試行中...</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0 text-danger" />
                <div className="space-y-2">
                  <p>集計を読み込めませんでした。</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setLoading(true);
                      window.setTimeout(() => {
                        setLoading(false);
                        setValue(1284000);
                      }, 1200);
                    }}
                  >
                    再試行
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  },
};

/**
 * 行・セル単位の失敗。
 *
 * 一部の値だけが取得できなかった場合、表全体をエラーにしない。
 * 取得できなかったセルだけをバッジに置き換え、他の列は読めるままにする。
 */
export const RowLevelError: Story = {
  render: () => (
    <Table<Request>
      columns={COLUMNS}
      rows={ROWS}
      rowKey={(r) => r.id}
      caption="申請の一覧（一部の金額が取得できていない）"
    />
  ),
};

/**
 * 権限がなく表示できない場合（403）。
 *
 * **再読み込みボタンを置かない。** 何度押しても解決しないため、
 * 誰に依頼すればよいかを書く。
 */
export const Forbidden: Story = {
  render: () => (
    <Card className="max-w-2xl">
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Lock />
            </EmptyMedia>
            <EmptyTitle>閲覧権限がありません</EmptyTitle>
            <EmptyDescription>
              この申請を見るには承認者権限が必要です。所属部署の管理者に権限の付与を依頼してください。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary">申請一覧へ戻る</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  ),
};
