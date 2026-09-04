import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField, Textarea } from "../../components/application";
import { Section, Showcase, Stack } from "../_showcase";

/**
 * Textarea は複数行入力。Input と同じ error と、maxLength と組の文字数カウンタを持つ。
 */
const meta = {
  title: "コンポーネント/Textarea",
  component: Textarea,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

複数行の入力と、上限がある入力の「残りが分かる」表現を統一する。
テンプレート側の \`textarea.input-field\` と同じ見た目。

## 使う場面

- 理由・備考・本文などの複数行入力
- 文字数に上限がある入力（\`maxLength\` + \`showCount\`）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 1 行の入力 | \`Input\`（\`showCount\` も持つ） |
| 見出し・箇条書き・リンクを含む文章 | リッチテキストエディタ（利用側で選定） |

## 注意事項

- \`maxLength\` の強制はブラウザが行う。カウンタは「残りが分かる」ためのもの
- \`error\` は色だけを変える。必ずエラーメッセージも表示する（\`FormField\` を使えば両方付く）
- 高さは内容に追従する（\`field-sizing: content\`）。\`rows\` で最低行数を指定する
        `,
      },
    },
  },
  args: {
    placeholder: "申請の理由",
    rows: 3,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本 / カウンタ / エラー / FormField との組み合わせ。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="基本" note="高さは内容に追従。rows は最低行数。">
        <Stack>
          <Textarea placeholder="申請の理由" rows={3} aria-label="申請の理由" />
        </Stack>
      </Section>
      <Section title="文字数カウンタ" note="maxLength と組で。上限に達すると入力できない。">
        <Stack>
          <Textarea maxLength={200} showCount defaultValue="モニターは 27 インチ 2 台。" aria-label="備考" />
        </Stack>
      </Section>
      <Section title="FormField と組み合わせる" note="ラベル・必須・エラーは FormField が持つ。">
        <Stack>
          <FormField label="理由" required error="理由を入力してください">
            <Textarea maxLength={500} showCount />
          </FormField>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = { args: { "aria-label": "本文" } };

/** 文字数カウンタ付き。 */
export const WithCount: Story = {
  args: { maxLength: 100, showCount: true, "aria-label": "備考" },
};
