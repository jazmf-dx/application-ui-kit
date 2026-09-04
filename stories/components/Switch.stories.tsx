import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Label, Switch } from "../../components/application";
import { Cluster, Section, Showcase, Stack } from "../_showcase";

/**
 * Switch は shadcn/ui（Base UI）の re-export。即時反映の ON / OFF。
 * テンプレート側の `input[type=checkbox].switch` と同じ見た目。
 */
const meta = {
  title: "コンポーネント/Switch",
  component: Switch,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

「押した瞬間に反映される ON / OFF」を表す。API は
[shadcn/ui の Switch](https://ui.shadcn.com/docs/components/switch) と同じ。

## 使う場面

- 公開 / 非公開、通知の ON / OFF など、押した瞬間に保存される設定
- 一覧の行内で状態を切り替える（\`hx-post\` で即時保存するテンプレートは \`.switch\`）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| フォーム送信でまとめて保存する項目 | \`Checkbox\`。スイッチは「すぐ反映される」と読まれる |
| 複数から選ぶ | \`Checkbox\` / \`RadioGroup\` |
| 押しボタン型のトグル（表示切替） | \`ButtonGroup\` |

## 注意事項

- ラベルは必ず付ける（\`Label\` の \`htmlFor\` か \`aria-label\`）。何が ON になるのか分からないスイッチを置かない
- 反映に時間がかかる場合は \`disabled\` にして待たせ、失敗したら元に戻して toast で伝える
        `,
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** サイズ / ラベル付き / 無効 を比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [on, setOn] = React.useState(true);
    return (
      <Showcase>
        <Section title="サイズ" note="default（36 × 20px）と sm（28 × 16px）。">
          <Cluster>
            <Switch defaultChecked aria-label="既定サイズ" />
            <Switch size="sm" defaultChecked aria-label="小サイズ" />
          </Cluster>
        </Section>
        <Section title="ラベル付き" note="Label の htmlFor で結び付ける。">
          <Stack>
            <div className="flex items-center gap-2">
              <Switch id="publish" checked={on} onCheckedChange={setOn} />
              <Label htmlFor="publish">公開する（{on ? "ON" : "OFF"}）</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="notify" defaultChecked />
              <Label htmlFor="notify">メールで通知する</Label>
            </div>
          </Stack>
        </Section>
        <Section title="無効" note="権限が無い・保存中。">
          <Cluster>
            <Switch disabled aria-label="無効（OFF）" />
            <Switch disabled defaultChecked aria-label="無効（ON）" />
          </Cluster>
        </Section>
      </Showcase>
    );
  },
};

/** 基本形。 */
export const Default: Story = {
  args: { defaultChecked: true, "aria-label": "公開する" },
};
