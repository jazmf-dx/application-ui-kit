import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  FieldSet,
  RadioTable,
  type RadioTableProps,
  type TableColumn,
} from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

type Plan = {
  id: string;
  name: string;
  users: number;
  storage: string;
  price: number;
  closed?: boolean;
};

const PLANS: Plan[] = [
  { id: "light", name: "ライト", users: 10, storage: "10 GB", price: 9800 },
  { id: "standard", name: "スタンダード", users: 50, storage: "100 GB", price: 29800 },
  { id: "business", name: "ビジネス", users: 150, storage: "500 GB", price: 59800 },
  {
    id: "enterprise",
    name: "エンタープライズ",
    users: 300,
    storage: "無制限",
    price: 98000,
    closed: true,
  },
];

const COLUMNS: TableColumn<Plan>[] = [
  { key: "name", header: "プラン", cell: (plan) => plan.name },
  { key: "users", header: "利用人数", align: "right", cell: (plan) => `${plan.users} 人` },
  { key: "storage", header: "容量", align: "right", cell: (plan) => plan.storage },
  {
    key: "price",
    header: "月額",
    align: "right",
    cell: (plan) => `${plan.price.toLocaleString()} 円`,
  },
];

/**
 * RadioTable は「表から1行を選ばせる」コンポーネント。
 *
 * <important>
 * 一覧を見せることが目的なら `Table` を使う。こちらは
 * **選んだ1件をフォームの値として送る** ためのもの。
 * </important>
 */
/** 総称型のため、Story の args は Plan で固定した props 型で受ける。 */
type PlanTableProps = RadioTableProps<Plan>;

const meta = {
  title: "Components/RadioTable",
  component: RadioTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

候補を複数の属性（人数・容量・金額など）で並べて比較させ、そのうち1件を選ばせる。

## 使う場面

- プラン・契約・料金の選択
- 送付先・請求先のように、住所や担当者まで見ないと決められない選択
- 取り込み対象・複写元のように、日付や件数を見比べて決める選択

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 一覧を見せるだけ（選択しない） | \`Table\` |
| 候補ごとに1〜2行の説明で足りる | \`RadioGroup variant="cards"\` |
| ラベルだけで決められる | \`RadioGroup\` / \`Select\` |
| 複数選びたい | チェックボックス列を持つ一覧（この部品は排他選択専用） |

## Props

- 列は \`Table\` と同じ \`columns\`（ラジオ列は自動で先頭に足される）
- \`rowValue\` が送信値、\`rowLabel\` が読み上げ名。**\`rowLabel\` は必ず渡す**
  （省略すると id がそのまま読まれる）
- \`caption\` は表の用途を支援技術に伝える（視覚的には非表示）

## 注意事項

- 行のどこを押しても選択できる。ラジオのドットだけを狙わせない
- 選択中の行は色を付けるが、色だけに頼らない（ラジオのドットが正）
- 行数が多い一覧には向かない。検索が必要なら \`Combobox\` を検討する
        `,
      },
    },
  },
  argTypes: {
    columns: { table: { disable: true } },
    rows: { table: { disable: true } },
    rowValue: { table: { disable: true } },
    rowLabel: { table: { disable: true } },
    rowDisabled: { table: { disable: true } },
    disabled: { control: "boolean" },
  },
  args: {
    columns: COLUMNS,
    rows: PLANS,
    rowValue: (plan) => plan.id,
    rowLabel: (plan) => plan.name,
    caption: "契約プランの選択",
    emptyMessage: "選べるプランがありません",
  },
} satisfies Meta<PlanTableProps>;

export default meta;
type Story = StoryObj<PlanTableProps>;

/** 状態を 1 画面で比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase className="max-w-none">
      <Section
        title="Default"
        note="行のどこを押しても選択できる。選択中の行には色が付くが、正はラジオのドット。"
      >
        <RadioTable<Plan>
          columns={COLUMNS}
          rows={PLANS.filter((plan) => !plan.closed)}
          rowValue={(plan) => plan.id}
          rowLabel={(plan) => plan.name}
          defaultValue="standard"
          caption="契約プランの選択"
        />
      </Section>

      <Section
        title="States"
        note="選べない行は rowDisabled で示す。理由が分かる文言を列の中にも出す。"
      >
        <Stack className="max-w-none space-y-6">
          <Labeled label="一部の行を選択不可（受付終了）">
            <RadioTable<Plan>
              columns={[
                ...COLUMNS,
                {
                  key: "note",
                  header: "備考",
                  cell: (plan) => (plan.closed ? "新規受付終了" : "—"),
                },
              ]}
              rows={PLANS}
              rowValue={(plan) => plan.id}
              rowLabel={(plan) => plan.name}
              rowDisabled={(plan) => Boolean(plan.closed)}
              defaultValue="standard"
              caption="契約プランの選択"
            />
          </Labeled>

          <Labeled label="表全体を無効化">
            <RadioTable<Plan>
              columns={COLUMNS}
              rows={PLANS.filter((plan) => !plan.closed)}
              rowValue={(plan) => plan.id}
              rowLabel={(plan) => plan.name}
              defaultValue="standard"
              caption="契約プランの選択"
              disabled
            />
          </Labeled>

          <Labeled label="0 件">
            <RadioTable<Plan>
              columns={COLUMNS}
              rows={[]}
              rowValue={(plan) => plan.id}
              rowLabel={(plan) => plan.name}
              caption="契約プランの選択"
              emptyMessage="選べるプランがありません"
              emptySubMessage="契約状況を確認してください"
            />
          </Labeled>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {
  args: { defaultValue: "standard" },
};

/** 選択不可の行がある例（受付終了・権限なしなど）。 */
export const WithDisabledRow: Story = {
  args: {
    defaultValue: "standard",
    rowDisabled: (plan) => Boolean(plan.closed),
  },
};

/** 0 件。空状態の文言は必ず指定する。 */
export const Empty: Story = {
  args: {
    rows: [],
    emptySubMessage: "契約状況を確認してください",
  },
};

/** 制御コンポーネントとして使う場合。 */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("standard");
    return (
      <div className="space-y-3">
        <RadioTable<Plan> {...args} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground">
          選択中の値: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{value}</code>
        </p>
      </div>
    );
  },
};

/** `FieldSet` と組み合わせた実際の使い方（グループなので FormField ではない）。 */
export const WithFormField: Story = {
  render: (args) => (
    <FieldSet label="契約プラン" required helpText="契約期間の途中でも変更できます">
      <RadioTable<Plan> {...args} name="plan" defaultValue="standard" />
    </FieldSet>
  ),
};
