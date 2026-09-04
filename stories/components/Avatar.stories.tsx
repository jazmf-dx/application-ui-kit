import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "../../components/application";
import { Cluster, Section, Showcase } from "../_showcase";

/**
 * Avatar は shadcn/ui（Base UI）の re-export。人・システムの丸いアイコン。
 * テンプレート側の `.avatar-sm / -md / -lg` と同じ寸法（20 / 28 / 36px）。
 */
const meta = {
  title: "コンポーネント/Avatar",
  component: Avatar,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

担当者・投稿者の表示を統一する。API は
[shadcn/ui の Avatar](https://ui.shadcn.com/docs/components/avatar) と同じ。

## 使う場面

- 一覧の担当者列、コメントの投稿者、ヘッダーのユーザーメニュー
- 参加者の重ね表示（\`AvatarGroup\`）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 状態を表す丸 | \`ActiveIndicator\` / \`Badge\` |
| テンプレート（.html） | \`<span class="avatar-md">山</span>\` |

## 注意事項

- 画像が無いときは \`AvatarFallback\` に頭文字を入れる（1〜2 文字）
- 名前をアバターだけで伝えない。横に文字を置くか \`aria-label\` を付ける
        `,
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** サイズ / フォールバック / グループを比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="サイズ" note="sm 20px / default 28px / lg 36px。テンプレートの avatar-* と同じ。">
        <Cluster>
          <Avatar size="sm">
            <AvatarFallback>山</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>山</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>山</AvatarFallback>
          </Avatar>
        </Cluster>
      </Section>
      <Section title="画像 + フォールバック" note="読み込めないときは頭文字。">
        <Cluster>
          <Avatar size="lg">
            <AvatarImage src="https://invalid.example/no-image.png" alt="山田 太郎" />
            <AvatarFallback>山</AvatarFallback>
          </Avatar>
          <span className="text-sm">山田 太郎</span>
        </Cluster>
      </Section>
      <Section title="グループ" note="参加者の重ね表示。あふれた分は件数で。">
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>山</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>鈴</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>佐</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>山</AvatarFallback>
    </Avatar>
  ),
};
