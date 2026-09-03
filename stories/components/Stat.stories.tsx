import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";
import { Stat } from "../../components/application";
import { Grid, Section, Showcase } from "../_showcase";

/**
 * Stat は KPI・統計タイル。値を主役に、ラベル・単位・増減・補足を定位置に置く。
 */
const meta = {
  title: "コンポーネント/Stat",
  component: Stat,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

ダッシュボード・詳細画面の上部に並ぶ「件数・率・金額」の表示を統一する。
テンプレート側の \`.stat\` と同じ見た目。

## 使う場面

- ダッシュボードの KPI 行（3〜5 枚を横に並べる）
- 詳細画面の要約（受講者数・完了率など）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 項目名と値の組が多い（住所・電話・担当…） | \`DescriptionList\`（予定）。数値が主役でないなら Stat にしない |
| 時系列の推移 | チャート（利用側で選定） |
| 進捗率の可視化 | \`Progress\` |

## 注意事項

- **数値の整形は呼び出し側**（\`toLocaleString()\` 等）。部品は文字列をそのまま描く
- \`tone\` は増減（\`delta\`）の色。値そのものに色は付かない。「増えたら良い」指標か「減ったら良い」指標かで
  positive / negative を呼び出し側が決める
- 並べるときは同じ幅のグリッドに置く。枚数は 3〜5。それ以上なら Table にする
        `,
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: ["neutral", "positive", "negative", "warning"] },
  },
  args: {
    label: "未対応",
    value: "12",
    unit: "件",
    delta: "+3 前週比",
    tone: "negative",
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

/** KPI 行として並べたときの見た目と、tone・補足・アイコンの有無を比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="KPI 行" note="同じ幅で 3〜5 枚。tone は増減の色で、値には付かない。">
        <Grid className="sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="未対応" value="12" unit="件" delta="+3 前週比" tone="negative" />
          <Stat label="対応中" value="38" unit="件" delta="±0" tone="neutral" />
          <Stat label="今月の完了" value="27" unit="件" delta="+9 前月比" tone="positive" />
          <Stat label="期限超過" value="4" unit="件" delta="要確認" tone="warning" />
        </Grid>
      </Section>

      <Section title="補足・アイコン付き" note="集計時点や母数は hint に。アイコンは意味の補助。">
        <Grid className="sm:grid-cols-3">
          <Stat
            label="完了率"
            value="86.5"
            unit="%"
            delta="+2.1pt"
            tone="positive"
            hint="2026-09-01 時点 · 受講対象 213 名"
            icon={<CheckCircle2 />}
          />
          <Stat label="受付" value="1,204" unit="件" hint="2026 年度累計" icon={<Inbox />} />
          <Stat label="未読の返信" value="7" unit="件" tone="warning" icon={<AlertCircle />} />
        </Grid>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/** 値だけ。 */
export const ValueOnly: Story = {
  args: { label: "今月の申請", value: "1,204", unit: "件", delta: undefined, tone: "neutral" },
};
