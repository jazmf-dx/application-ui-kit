import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, DescriptionList } from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * DescriptionList は詳細画面の「項目名と値」。
 */
const meta = {
  title: "コンポーネント/DescriptionList",
  component: DescriptionList,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

詳細画面で項目名と値の組を並べる形を 1 つに固定する（\`<dl>\` / 2 列の表 / flex が混在していた）。
テンプレート側の \`.description-list\` と同じ見た目。

## 使う場面

- 詳細画面の基本情報（申請番号・申請者・部署・日付）
- 確認画面（入力内容の見直し）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 値が主役の指標（件数・率・金額の要約） | \`Stat\` |
| 同じ構造の行が多数 | \`Table\` |
| 編集できる項目 | \`FormField\` |

## 注意事項

- 空の値は「—」で描き、行を消さない（無いこと自体が情報）
- 長い値は折り返す。省略記号で隠さない
- 2 列以上にするときは、備考のような長い項目に \`span\` を付けて 1 行を使う
        `,
      },
    },
  },
  args: {
    items: [
      { term: "申請番号", description: "SYS-2026-0001" },
      { term: "申請者", description: "山田 太郎" },
      { term: "部署", description: "情報システム部" },
      { term: "申請日", description: "2026-08-30" },
    ],
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  { term: "申請番号", description: "SYS-2026-0001" },
  { term: "ステータス", description: <Badge tone="active">対応中</Badge> },
  { term: "申請者", description: "山田 太郎" },
  { term: "部署", description: "情報システム部" },
  { term: "申請日", description: "2026-08-30" },
  { term: "承認日", description: null },
  {
    term: "備考",
    description: "モニターは 27 インチ 2 台。設置は 9 月第 2 週を希望。既存のアームは流用する。",
    span: 2 as const,
  },
];

/** 1 列 / 2 列 / inline を比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="2 列（既定の stacked）" note="項目名の下に値。備考は span=2 で 1 行を使う。空は「—」。">
        <DescriptionList items={ITEMS} columns={2} />
      </Section>
      <Section title="inline" note="項目名の右に値。項目が少なく、縦に読ませるとき。">
        <div className="max-w-md">
          <DescriptionList items={ITEMS.slice(0, 5)} layout="inline" />
        </div>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/** 3 列。 */
export const ThreeColumns: Story = {
  args: { columns: 3, items: ITEMS.map((i) => ({ ...i, span: i.span ? (3 as const) : undefined })) },
};
