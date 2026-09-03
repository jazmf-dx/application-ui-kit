import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { SearchInput, Table } from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

/**
 * SearchInput は一覧・テーブルの上に置くフィルタ用検索欄。
 *
 * <important>
 * ラベルを視覚的に置かない場面が多いため、`aria-label` を必ず渡す
 * （`FormField` で囲む場合は不要）。
 * </important>
 */
const meta = {
  title: "Components/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

検索アイコン + クリアボタンの組み合わせを毎回書かずに済むようにする。
見た目は \`Input\` と同じ。

## 使う場面

- 一覧・テーブルの上のキーワード絞り込み

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 選択肢から選ぶ絞り込み | \`Select\` |
| 社員・取引先など候補から選ぶ検索 | \`Combobox\`（React） / ネイティブの \`<select>\`（テンプレート） |

## 注意事項

- \`onClear\` を渡すと、値がある間だけ右側にクリアボタン（×）が表示される
- \`onClear\` を渡さない場合はクリアボタンなしの検索欄になる（非制御で十分な場合）
- \`type="search"\` を使っているため、ブラウザ標準のクリア用 ×（WebKit）は非表示にしている
        `,
      },
    },
  },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    placeholder: "タイトルで検索",
    "aria-label": "検索",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 状態を 1 画面で比較する。
 *
 * クリアボタン（×）は `onClear` を渡し、かつ値があるときだけ出る。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [keyword, setKeyword] = React.useState("備品");

    return (
      <Showcase>
        <Section
          title="States"
          note="ラベルを画面に置かない場合は aria-label が必須。placeholder は代わりにならない。"
        >
          <Stack>
            <Labeled label="空（クリアボタンなし）">
              <SearchInput placeholder="タイトルで検索" aria-label="検索" />
            </Labeled>
            <Labeled label="入力済み + onClear（× が出る）">
              <SearchInput
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onClear={() => setKeyword("")}
                placeholder="タイトルで検索"
                aria-label="検索（クリア付き）"
              />
            </Labeled>
            <Labeled label="無効">
              <SearchInput
                placeholder="タイトルで検索"
                disabled
                aria-label="検索（無効）"
              />
            </Labeled>
          </Stack>
        </Section>

        <Section title="In Toolbar" note="一覧の上に置く。件数の表示は検索欄の外に持つ。">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
            <div className="max-w-xs flex-1">
              <SearchInput placeholder="タイトルで検索" aria-label="検索" />
            </div>
            <span className="text-xs text-muted-foreground">6 件</span>
          </div>
        </Section>
      </Showcase>
    );
  },
};

/** 基本形（非制御）。 */
export const Default: Story = {};

/** 操作不可。 */
export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * 制御コンポーネント + クリアボタン。
 *
 * 実際の一覧絞り込みではこの形で使う。
 */
export const Controlled: Story = {
  render: (args) => {
    const [keyword, setKeyword] = React.useState("備品");
    return (
      <SearchInput
        {...args}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onClear={() => setKeyword("")}
      />
    );
  },
};

type Row = { id: number; title: string };

/** テーブル上部の絞り込みとして使う実際の使い方。 */
export const WithTable: Story = {
  render: () => {
    const [keyword, setKeyword] = React.useState("");
    const ALL: Row[] = [
      { id: 1, title: "備品購入申請" },
      { id: 2, title: "出張申請" },
      { id: 3, title: "休暇申請" },
    ];
    const rows = ALL.filter((r) => r.title.includes(keyword));

    return (
      <div className="space-y-3">
        <SearchInput
          aria-label="件名で検索"
          placeholder="件名で検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onClear={() => setKeyword("")}
        />
        <Table<Row>
          columns={[{ key: "title", header: "件名", cell: (r) => r.title }]}
          rows={rows}
          rowKey={(r) => r.id}
          emptyMessage="該当する申請がありません"
        />
      </div>
    );
  },
};
