import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info, Pencil, Trash } from "lucide-react";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/application";
import { Cluster, Section, Showcase } from "../_showcase";

/**
 * Tooltip は shadcn/ui（Base UI）の re-export。アイコンボタンの名前や短い補足。
 */
const meta = {
  title: "コンポーネント/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

\`title\` 属性の代わり。\`title\` は表示まで約 1 秒かかり、タッチでは出ず、見た目も揃えられない。
API は [shadcn/ui の Tooltip](https://ui.shadcn.com/docs/components/tooltip) と同じ。

## 使う場面

- アイコンだけのボタンの名前（編集・削除・複製）
- 列見出しやラベルの短い補足（「?」アイコン）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 中に操作（ボタン・リンク）を置きたい | \`Popover\`（hover で消えるツールチップでは押せない） |
| 2 行を超える説明 | \`Popover\` か、そもそも画面に書く |
| 必ず読ませたい注意 | \`Alert\`。ツールチップは気づかれない前提 |

## 注意事項

- アイコンボタンには \`aria-label\` も付ける。ツールチップは支援技術に読まれないことがある
- \`TooltipProvider\` をまとめて 1 つ置くと、隣接するツールチップの表示遅延が揃う
        `,
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** アイコンボタン / 補足 / 位置 を比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <TooltipProvider>
      <Showcase>
        <Section title="アイコンボタンの名前" note="aria-label と同じ文言を出す。">
          <Cluster>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="編集" />}>
                <Pencil />
              </TooltipTrigger>
              <TooltipContent>編集</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="削除" />}>
                <Trash />
              </TooltipTrigger>
              <TooltipContent>削除</TooltipContent>
            </Tooltip>
          </Cluster>
        </Section>
        <Section title="ラベルの補足" note="「?」アイコンに短い説明。">
          <div className="flex items-center gap-1 text-sm">
            <span>完了率</span>
            <Tooltip>
              <TooltipTrigger
                render={<button type="button" className="text-muted-foreground" aria-label="完了率の説明" />}
              >
                <Info className="size-4" />
              </TooltipTrigger>
              <TooltipContent>受講対象者のうち、修了した人の割合</TooltipContent>
            </Tooltip>
          </div>
        </Section>
        <Section title="位置" note="side で上下左右。">
          <Cluster>
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side}>
                <TooltipTrigger render={<Button variant="secondary" size="sm" />}>{side}</TooltipTrigger>
                <TooltipContent side={side}>{side} に出る</TooltipContent>
              </Tooltip>
            ))}
          </Cluster>
        </Section>
      </Showcase>
    </TooltipProvider>
  ),
};

/** 基本形。 */
export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>ホバーして表示</TooltipTrigger>
        <TooltipContent>短い補足を出す</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
