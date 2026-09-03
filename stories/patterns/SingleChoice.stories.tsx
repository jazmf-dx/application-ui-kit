import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  ButtonGroup,
  Combobox,
  RadioGroup,
  RadioTable,
  Select,
  type TableColumn,
} from "../../components/application";

const CHOICES = [
  { value: "standard", label: "標準", description: "通常の申請・承認フローを利用します" },
  { value: "fast", label: "簡易", description: "少ない入力項目で素早く登録します" },
  { value: "advanced", label: "詳細", description: "追加設定を含めて登録します" },
];

const DEPARTMENTS = [
  { value: "sales", label: "営業部", badge: "本社" },
  { value: "admin", label: "総務部", badge: "本社" },
  { value: "dev", label: "開発部", badge: "本社" },
  { value: "quality", label: "品質管理課", badge: "工場" },
  { value: "production", label: "製造部", badge: "工場" },
];

const meta = {
  title: "パターン/単一選択",
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component: `
## Problem

複数候補から1つだけ選択させる場面では、選択肢数・比較の重要度・説明量・検索の必要性で適切なUIが変わります。

このStoryは「どのComponentが存在するか」ではなく、**同じUX課題をどう解くかを比較するCatalog**です。

詳しい判断軸は \`patterns/single-choice.md\` を参照してください。

### 目安

- **Radio**: 2〜5件程度で常に比較したい
- **Select**: やや多い候補を省スペースで選ぶ
- **Combobox**: 候補が多く検索が必要
- **Button Group**: 短いモード・表示切替
- **Card Choice**（\`RadioGroup variant="cards"\`）: 候補ごとの説明や違いを比較したい
- **Radio Table**（\`RadioTable\`）: 候補を複数の属性（人数・金額など）で並べて比較したい
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ExampleSection({
  title,
  guidance,
  children,
}: {
  title: string;
  guidance: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{guidance}</p>
      </div>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

type Plan = { id: string; name: string; users: number; price: number };

const PLANS: Plan[] = [
  { id: "light", name: "ライト", users: 10, price: 9800 },
  { id: "standard", name: "スタンダード", users: 50, price: 29800 },
  { id: "enterprise", name: "エンタープライズ", users: 300, price: 98000 },
];

const PLAN_COLUMNS: TableColumn<Plan>[] = [
  { key: "name", header: "プラン", cell: (plan) => plan.name },
  { key: "users", header: "利用人数", align: "right", cell: (plan) => `${plan.users} 人` },
  {
    key: "price",
    header: "月額",
    align: "right",
    cell: (plan) => `${plan.price.toLocaleString()} 円`,
  },
];

/** 主要な選択肢を同一画面で比較する。新しい単一選択UIを設計するときはまずここを見る。 */
export const Comparison: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl space-y-5">
      <ExampleSection title="Radio" guidance="2〜5件程度。候補を常に見せ、比較しながら選ばせたい場合。">
        <RadioGroup items={CHOICES} defaultValue="standard" name="radio-example" />
      </ExampleSection>

      <ExampleSection title="Select" guidance="候補がやや多く、常時表示する必要がない場合。">
        <Select
          items={CHOICES.map(({ value, label }) => ({ value, label }))}
          defaultValue="standard"
          placeholder="登録方法を選択"
          aria-label="登録方法"
        />
      </ExampleSection>

      <ExampleSection title="Combobox" guidance="部署・社員など候補が多く、入力して絞り込みたい場合。">
        <Combobox
          items={DEPARTMENTS}
          placeholder="部署を検索"
          clearable
          aria-label="部署"
        />
      </ExampleSection>

      <ExampleSection title="Button Group" guidance="2〜4件程度の短いモード・表示切替。長い説明を伴うフォーム選択には使わない。">
        <ButtonGroup
          items={[
            { value: "day", label: "日" },
            { value: "week", label: "週" },
            { value: "month", label: "月" },
          ]}
          defaultValue="week"
          aria-label="表示期間"
        />
      </ExampleSection>

      <ExampleSection title="Card Choice" guidance="各候補の違いや説明を見比べて選ぶこと自体に価値がある場合。RadioGroup の cards バリアント。">
        <RadioGroup
          variant="cards"
          orientation="horizontal"
          items={CHOICES}
          defaultValue="standard"
          name="card-choice-example"
        />
      </ExampleSection>

      <ExampleSection title="Radio Table" guidance="候補を人数・金額のような複数の属性で並べて比較させたい場合。列が要らないなら Card Choice で足りる。">
        <RadioTable<Plan>
          columns={PLAN_COLUMNS}
          rows={PLANS}
          rowValue={(plan) => plan.id}
          rowLabel={(plan) => plan.name}
          name="plan-example"
          defaultValue="standard"
          caption="契約プランの選択"
          emptyMessage="選べるプランがありません"
        />
      </ExampleSection>
    </div>
  ),
};
