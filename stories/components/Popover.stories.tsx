import type { Meta, StoryObj } from "@storybook/react-vite";
import { SlidersHorizontal } from "lucide-react";
import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * Popover は shadcn/ui（Base UI）の re-export。操作を含む小さな浮遊パネル。
 */
const meta = {
  title: "コンポーネント/Popover",
  component: Popover,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

ボタンの近くに、操作や説明を含む小さなパネルを出す。API は
[shadcn/ui の Popover](https://ui.shadcn.com/docs/components/popover) と同じ。

## 使う場面

- 表示列の切替、絞り込みの詳細条件など「一覧の脇で完結する小さな設定」
- 参加者一覧など、ホバーで見せるには多いが画面遷移するほどでもない情報

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 短い補足だけ | \`Tooltip\` |
| 入力項目が 3 つを超える・保存を伴う | \`FormDialog\` |
| メニュー（項目を 1 つ選んで実行） | \`Dropdown\` |

## 注意事項

- 中の操作は即時反映にする。「保存」ボタンが要る内容なら FormDialog
- 開いたときのフォーカスと Escape で閉じる動作は Base UI が持つ。壊さない
        `,
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 表示列の切替パネル。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="表示列の切替" note="一覧の脇で完結する小さな設定。チェックは即時反映。">
        <Popover>
          <PopoverTrigger render={<Button variant="secondary" size="sm" leftIcon={<SlidersHorizontal />} />}>
            表示列
          </PopoverTrigger>
          <PopoverContent align="start">
            <PopoverHeader>
              <PopoverTitle>表示する列</PopoverTitle>
              <PopoverDescription>チェックした列だけを表に出します</PopoverDescription>
            </PopoverHeader>
            <div className="mt-3 space-y-2">
              <Checkbox label="申請番号" defaultChecked />
              <Checkbox label="件名" defaultChecked />
              <Checkbox label="申請者" defaultChecked />
              <Checkbox label="金額" />
            </div>
          </PopoverContent>
        </Popover>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>開く</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>見出し</PopoverTitle>
          <PopoverDescription>短い説明。</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};
