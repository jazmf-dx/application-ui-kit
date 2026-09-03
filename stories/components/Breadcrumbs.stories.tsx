import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs } from "../../components/application";
import { Section, Showcase, Stack } from "../_showcase";

/**
 * Breadcrumbs は現在位置。末尾が現在地で、リンクにしない。
 */
const meta = {
  title: "コンポーネント/Breadcrumbs",
  component: Breadcrumbs,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

「いまどこにいるか」と「上の階層へ戻る」を 1 行で示す。テンプレート側の \`.breadcrumbs\` と同じ見た目。

## 使う場面

- 一覧 → 詳細 → 編集のように階層がある画面。詳細・編集画面には原則置く
- \`PageHeader\` の \`breadcrumbs\` に配列を渡すのが基本形

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| トップレベルの一覧（階層が無い） | 置かない |
| 画面内の切替（概要 / 履歴） | \`Tabs\` |
| 手順の進み具合 | \`Steps\`（予定） |

## 注意事項

- **末尾は現在地。リンクにしない**（部品が自動で \`aria-current="page"\` を付ける）
- ラベルは画面の見出しと同じ言葉にする。「詳細」より「モニターの増設」
- 3〜4 階層まで。それ以上になるなら情報設計を見直す（省略記号は持たない）
        `,
      },
    },
  },
  args: {
    items: [
      { label: "ホーム", href: "/" },
      { label: "アイデア", href: "/ideas/" },
      { label: "モニターの増設" },
    ],
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 階層の深さ・リンク無し項目・長いラベルを比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="基本" note="末尾が現在地。途中は上の階層へのリンク。">
        <Stack className="max-w-none">
          <Breadcrumbs items={[{ label: "ホーム", href: "/" }, { label: "アイデア" }]} />
          <Breadcrumbs
            items={[
              { label: "ホーム", href: "/" },
              { label: "アイデア", href: "/ideas/" },
              { label: "モニターの増設" },
            ]}
          />
          <Breadcrumbs
            items={[
              { label: "ホーム", href: "/" },
              { label: "アイデア", href: "/ideas/" },
              { label: "モニターの増設", href: "/ideas/12/" },
              { label: "編集" },
            ]}
          />
        </Stack>
      </Section>

      <Section title="リンクにならない途中項目" note="href を省くと文字だけになる（区分名など、遷移先が無い階層）。">
        <Breadcrumbs items={[{ label: "管理" }, { label: "ユーザー", href: "/manage/users/" }, { label: "山田 太郎" }]} />
      </Section>

      <Section title="長いラベル" note="折り返しは許容する。ラベル自体を短くするのが先。">
        <div className="max-w-sm">
          <Breadcrumbs
            items={[
              { label: "ホーム", href: "/" },
              { label: "巡回・訪問スケジュール", href: "/visits/" },
              { label: "2026 年 9 月 北営業所 定期巡回（第 2 回）" },
            ]}
          />
        </div>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};
