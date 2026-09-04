import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Button, Steps } from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * Steps は手順の進み具合。手順そのものの画面遷移や検証は呼び出し側が持つ。
 */
const meta = {
  title: "コンポーネント/Steps",
  component: Steps,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

「いまどこで、あと何が残っているか」を示す。取り込み → 加工 → 出力のような順番のある手順に使う。
テンプレート側の \`.steps\` と同じ見た目。

## 使う場面

- ウィザード（入力項目が 20 個を超えるフォームの分割）
- 申請フローの進捗（受付 → 審査 → 承認）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 同じ階層のビューを切り替える（順番が無い） | \`Tabs\` |
| 進捗率（%） | \`Progress\` |
| 手順が 2 つ以下 | 使わない。見出しで足りる |

## 注意事項

- \`current\` を渡せば状態は自動で決まる。差戻しなど例外だけ \`status\` で上書きする
- 戻れる手順だけ \`onStepClick\` を渡す（済んだ手順をクリックして戻る）。先へは飛ばせない
- 7 つを超えるなら手順を束ね直す。横並びは 5 つまでが読みやすい
        `,
      },
    },
  },
  args: {
    items: [
      { label: "取り込み", description: "CSV を選ぶ" },
      { label: "加工", description: "列を整える" },
      { label: "出力", description: "形式を選ぶ" },
    ],
    current: 1,
  },
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 横 / 縦 / エラー / 戻れる手順を比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [current, setCurrent] = React.useState(2);
    const items = [
      { label: "取り込み", description: "CSV を選ぶ" },
      { label: "加工", description: "列を整える" },
      { label: "確認", description: "内容を見直す" },
      { label: "出力" },
    ];
    return (
      <Showcase>
        <Section title="横並び（既定）" note="済は塗り、いまは枠、未着手はグレー。">
          <Steps items={items} current={1} />
        </Section>
        <Section title="縦並び" note="説明が長い手順や、サイドに置くときに。">
          <div className="max-w-xs">
            <Steps items={items} current={1} orientation="vertical" />
          </div>
        </Section>
        <Section title="要対応の手順" note="差戻しなどは status=error で上書きする。">
          <Steps
            items={[
              { label: "受付", status: "done" },
              { label: "審査", status: "error", description: "差戻し: 金額の根拠が不足" },
              { label: "承認" },
            ]}
          />
        </Section>
        <Section title="戻れる手順" note="onStepClick を渡すと済んだ手順だけボタンになる。">
          <div className="space-y-4">
            <Steps items={items} current={current} onStepClick={setCurrent} />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
                戻る
              </Button>
              <Button size="sm" onClick={() => setCurrent((c) => Math.min(items.length - 1, c + 1))}>
                次へ
              </Button>
            </div>
          </div>
        </Section>
      </Showcase>
    );
  },
};

/** 基本形。 */
export const Default: Story = {};

/** 縦並び。 */
export const Vertical: Story = {
  args: { orientation: "vertical" },
};
