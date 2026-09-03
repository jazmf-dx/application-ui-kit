import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ButtonGroup,
  FieldSet,
  FormField,
  RadioGroup,
} from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

const PRIORITIES = [
  { value: "high", label: "高" },
  { value: "mid", label: "中" },
  { value: "low", label: "低" },
];

const PERIODS = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
];

/**
 * FieldSet は「グループで選ぶ入力」にラベル・エラー・ヘルプを付ける部品。
 *
 * <important>
 * `<label for>` は labelable 要素にしか効かない。ラジオグループやボタングループへ
 * `FormField` を使うと、**ラベルはあるのにアクセシブル名が付かない**。
 * </important>
 */
const meta = {
  title: "コンポーネント/FieldSet",
  component: FieldSet,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

ラジオグループ・ボタングループのように「単一のフォームコントロールが無い」入力へ、
ラベル・必須表示・エラー・ヘルプを付ける。

## FormField との使い分け

| 子 | 使うもの | 名前の結び方 |
|---|---|---|
| 単一のコントロール（Input / Select / Combobox / TreeSelect / DatePicker / Textarea） | \`FormField\` | \`<label for>\` → コントロールの id |
| グループ（RadioGroup / RadioTable / ButtonGroup） | **\`FieldSet\`** | \`<legend>\` → \`aria-labelledby\` |
| チェックボックス 1 個 | どちらも使わない | \`Checkbox\` が自分で \`label\` を持つ |

**\`<label for>\` は button / input / select / textarea / meter / output / progress にしか効かない。**
\`<div role="radiogroup">\` や \`<div role="group">\` を指してもブラウザは黙って無視するため、
グループへ \`FormField\` を使うと読み上げ名が付かない。

## エラー表現

\`error\` を渡すと 3 つが同時に起きる。

1. \`FieldSet\` に \`data-invalid\` … legend と説明が destructive 色になる
2. グループに \`aria-invalid\` … 支援技術へ伝わり、枠が danger 色になる
3. \`aria-describedby\` … エラー文言とヘルプがグループに紐づく

## 注意事項

- グループ本体（\`RadioGroup\` 等）へ \`aria-label\` を重ねて渡さない。名前が二重になる
- 必須は \`*\` だけでなく \`（必須）\` の文字でも伝える（この部品が自動で入れる）
        `,
      },
    },
  },
  args: {
    label: "優先度",
    children: <RadioGroup items={PRIORITIES} name="priority" />,
  },
} satisfies Meta<typeof FieldSet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 対応するグループ部品と、error / helpText の出方を 1 画面で比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="Groups" note="グループ部品はこの形で囲む。名前は legend から aria-labelledby で結ぶ。">
        <Stack className="max-w-md">
          <FieldSet label="優先度" required helpText="後から変更できます">
            <RadioGroup items={PRIORITIES} name="priority" defaultValue="mid" />
          </FieldSet>

          <FieldSet label="表示期間" required>
            <ButtonGroup items={PERIODS} name="period" defaultValue="week" />
          </FieldSet>
        </Stack>
      </Section>

      <Section
        title="Error"
        note="error を渡すと legend が destructive 色になり、グループが aria-invalid になる。"
      >
        <Stack className="max-w-md">
          <FieldSet label="優先度" required error="優先度を選択してください">
            <RadioGroup items={PRIORITIES} name="priority-error" />
          </FieldSet>

          <FieldSet label="表示期間" required error="表示期間を選択してください">
            <ButtonGroup items={PERIODS} name="period-error" />
          </FieldSet>
        </Stack>
      </Section>

      <Section
        title="FormField との違い"
        note="上は名前が付く。下はラベルが見えていても、支援技術からは名前の無いグループになる。"
      >
        <Stack className="max-w-md">
          <Labeled label="FieldSet（正）">
            <FieldSet label="優先度">
              <RadioGroup items={PRIORITIES} name="ok" />
            </FieldSet>
          </Labeled>
          <Labeled label="FormField（グループには使わない）">
            <FormField label="優先度">
              <RadioGroup items={PRIORITIES} name="ng" />
            </FormField>
          </Labeled>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/** 必須 + ヘルプ。 */
export const RequiredWithHelp: Story = {
  args: { required: true, helpText: "後から変更できます" },
};

/** エラー。 */
export const WithError: Story = {
  args: { required: true, error: "優先度を選択してください" },
};

/** ボタングループ。 */
export const WithButtonGroup: Story = {
  args: {
    label: "表示期間",
    required: true,
    children: <ButtonGroup items={PERIODS} name="period" defaultValue="week" />,
  },
};
