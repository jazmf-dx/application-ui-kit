import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Pagination, Table } from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

/**
 * Pagination は一覧・テーブルの下に置くページ送り UI。
 *
 * <important>
 * ページ番号の計算や現在ページの保持は画面側（またはサーバー側のレンダリング）の責務。
 * このコンポーネントは見た目とキーボード操作だけを提供する。
 * </important>
 */
const meta = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

一覧の下に置くページ送りの見た目とキーボード操作を統一する。

## 使う場面

- \`Table\` の下（React コンポーネントでのページング）
- 検索結果・履歴一覧の下

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| テンプレート（.html）の一覧 | \`includes/molecules/pagination.html\`（既存のサーバーレンダリング版） |
| 件数が少なくページングが不要 | 使わない（\`totalPages <= 1\` では自動的に何も描画されない） |
| 無限スクロール | 使わない（別途実装） |

## 注意事項

- ページ番号は **1 始まり**
- \`totalPages\` が大きい場合は現在ページ周辺だけを表示し、省略記号（…）で省く
- \`siblingCount\` で現在ページの前後に表示する数を調整できる（既定は 1）
        `,
      },
    },
  },
  argTypes: {
    onPageChange: { table: { disable: true } },
  },
  args: {
    page: 1,
    totalPages: 10,
    onPageChange: () => {},
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ページ数と現在位置による表示の違いを 1 画面で比較する。
 *
 * ページ番号は 1 始まり。`totalPages <= 1` では何も描画されない。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="ページ数" note="多いときは現在ページ周辺だけを出し、省略記号（…）で省く。">
        <Stack className="max-w-xl">
          <Labeled label="totalPages=5（全ページを表示）">
            <Pagination page={3} totalPages={5} onPageChange={() => {}} />
          </Labeled>
          <Labeled label="totalPages=50（省略記号あり）">
            <Pagination page={25} totalPages={50} onPageChange={() => {}} />
          </Labeled>
          <Labeled label="totalPages=1（何も描画されない）">
            <Pagination page={1} totalPages={1} onPageChange={() => {}} />
          </Labeled>
        </Stack>
      </Section>

      <Section title="現在位置" note="端では「前へ」「次へ」が無効になる。押せないボタンを隠さない（位置がずれるため）。">
        <Stack className="max-w-xl">
          <Labeled label="先頭ページ">
            <Pagination page={1} totalPages={20} onPageChange={() => {}} />
          </Labeled>
          <Labeled label="末尾ページ">
            <Pagination page={20} totalPages={20} onPageChange={() => {}} />
          </Labeled>
        </Stack>
      </Section>

      <Section title="siblingCount" note="現在ページの前後に出す数。既定は 1。狭い画面では増やさない。">
        <Stack className="max-w-xl">
          <Labeled label="siblingCount=1（既定）">
            <Pagination page={10} totalPages={20} onPageChange={() => {}} />
          </Labeled>
          <Labeled label="siblingCount=2">
            <Pagination page={10} totalPages={20} siblingCount={2} onPageChange={() => {}} />
          </Labeled>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。ページ数が少ない場合は全ページ番号を表示する。 */
export const Default: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    return <Pagination page={page} totalPages={5} onPageChange={setPage} />;
  },
};

/** ページ数が多い場合。現在ページの前後だけ表示し、両端は省略記号でまとめる。 */
export const ManyPages: Story = {
  render: () => {
    const [page, setPage] = React.useState(7);
    return <Pagination page={page} totalPages={42} onPageChange={setPage} />;
  },
};

/** 先頭ページ。前へボタンが無効になる。 */
export const FirstPage: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    return <Pagination page={page} totalPages={20} onPageChange={setPage} />;
  },
};

/** 末尾ページ。次へボタンが無効になる。 */
export const LastPage: Story = {
  render: () => {
    const [page, setPage] = React.useState(20);
    return <Pagination page={page} totalPages={20} onPageChange={setPage} />;
  },
};

/** ページ数が1件以下の場合。何も描画されない（ページングが不要なため）。 */
export const SinglePage: Story = {
  render: () => <Pagination page={1} totalPages={1} onPageChange={() => {}} />,
};

type Row = { id: number; name: string; amount: number };

/** Table と組み合わせた実際の使い方。 */
export const WithTable: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    const rows: Row[] = Array.from({ length: 5 }, (_, i) => ({
      id: (page - 1) * 5 + i + 1,
      name: `申請 #${(page - 1) * 5 + i + 1}`,
      amount: 12000 + i * 500,
    }));

    return (
      <div className="space-y-3">
        <Table<Row>
          columns={[
            { key: "name", header: "件名", cell: (r) => r.name },
            {
              key: "amount",
              header: "金額",
              align: "right",
              cell: (r) => `${r.amount.toLocaleString()} 円`,
            },
          ]}
          rows={rows}
          rowKey={(r) => r.id}
        />
        <Pagination page={page} totalPages={10} onPageChange={setPage} />
      </div>
    );
  },
};
