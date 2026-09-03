import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  FormField,
  Input,
  Select,
} from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

/**
 * FormField はラベル・入力欄・エラー・ヘルプをまとめる部品。
 *
 * <important>
 * React でフォームを組むときは **必ずこれを使う**。
 * ラベルと入力を自分で並べると、余白・必須マーク・aria の紐づけが画面ごとにばらつく。
 * </important>
 */
const meta = {
  title: "Components/FormField",
  component: FormField,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

application の \`includes/molecules/form_field.html\` の React 版。
以下を 1 箇所に集約する。

- **余白の固定** — ラベル下 \`mb-1.5\` / エラー上 \`mt-1.5\` / ヘルプ上 \`mt-1\`
- **必須マーク** — \`*\`（視覚）+ \`（必須）\`（読み上げ専用）
- **id の自動生成と紐づけ** — \`label[for]\` ↔ \`input[id]\`
- **エラーの伝達** — 子に \`aria-invalid\` / \`aria-describedby\` / \`error\` を注入し、
  エラーメッセージに \`role="alert"\` を付ける

## 使う場面

- React コンポーネント内のすべてのフォーム項目

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| テンプレート（.html） | \`{% include 'includes/molecules/form_field.html' %}\` |
| ラベルが不要な入力（検索ボックス、テーブル内のインライン編集） | \`Input\` 単体 + \`aria-label\` |
| チェックボックス | \`Checkbox\`（ラベルを自前で持っているため二重になる） |
| グループで選ぶ入力（RadioGroup / RadioTable / ButtonGroup） | **\`FieldSet\`** |

**グループには使わない。** \`<label for>\` は button / input / select / textarea /
meter / output / progress にしか効かず、\`<div role="radiogroup">\` や
\`<div role="group">\` を指してもブラウザは黙って無視する。結果、ラベルが見えていても
支援技術からは**名前の無いグループ**になる。\`FieldSet\` は
\`<legend>\` + \`aria-labelledby\` で結ぶ。

## Props

| Prop | 説明 |
|---|---|
| \`label\` | ラベル文字列 |
| \`required\` | 必須マークを表示する |
| \`error\` | エラーメッセージ。渡すと赤字表示 + 子が赤枠になる |
| \`helpText\` | 補足説明 |
| \`children\` | 入力欄（**単一の React 要素**） |
| \`htmlFor\` | 入力欄の id。省略時は自動生成 |

## 注意事項

- **\`children\` は単一要素。** 複数渡すと \`cloneElement\` が失敗する。
  横並びにしたい場合は \`children\` を \`<div>\` で包み、
  \`htmlFor\` を明示して内側の入力に \`id\` を自分で付ける
- **\`error\` を渡すと 2 つの属性が付く。** shadcn/ui のエラー表現に合わせている。
  \`Field\` に \`data-invalid\`（ラベルと説明が destructive 色になる）と、
  子に \`aria-invalid\`（支援技術へ伝わり、枠が danger 色になる）。
  独自 prop は注入しない（以前は \`error: true\` も注入しており、
  受け取れない子では DOM へ漏れて React が警告していた）
- \`required\` は見た目の \`*\` だけでなく \`（必須）\` を \`sr-only\` で出す。
  \`*\` は読み上げでは「アスタリスク」または無視されるため
- **HTML の \`required\` 属性とは別物。** バリデーションが必要なら
  子の入力欄にも \`required\` を渡す
- application フォームと連携する場合は \`htmlFor={field.id_for_label}\` を渡して id を揃える
        `,
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    error: { control: "text" },
    helpText: { control: "text" },
    children: { table: { disable: true } },
  },
  args: {
    label: "件名",
    children: <Input placeholder="例: 備品購入の申請" />,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ラベル・必須・ヘルプ・エラー・並び方向を 1 画面で比較する。
 *
 * `error` があるときはヘルプではなくエラーを優先して読ませる。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="Label" note="必須は required で示す。「任意」と書きたいときは helpText に置く。">
        <Stack className="max-w-md">
          <FormField label="件名">
            <Input placeholder="例: 備品購入の申請" />
          </FormField>
          <FormField label="件名" required>
            <Input placeholder="例: 備品購入の申請" />
          </FormField>
        </Stack>
      </Section>

      <Section
        title="Help / Error"
        note="ヘルプは入力前に読むもの、エラーは入力後に読むもの。両方あるときはエラーを上に出す。"
      >
        <Stack className="max-w-md">
          <FormField label="件名" helpText="50 文字以内で入力してください">
            <Input placeholder="例: 備品購入の申請" />
          </FormField>
          <FormField label="件名" required error="件名は必須です">
            <Input error defaultValue="" />
          </FormField>
          <FormField
            label="件名"
            required
            error="50 文字以内で入力してください"
            helpText="申請の内容が分かる名前にしてください"
          >
            <Input error defaultValue="長すぎる件名..." />
          </FormField>
        </Stack>
      </Section>

      <Section
        title="Orientation"
        note="既定は vertical。horizontal は設定画面のように項目が少ない画面だけに使う。"
      >
        <Stack className="max-w-2xl">
          <Labeled label="vertical（既定）">
            <FormField label="優先度" required>
              <Select
                items={[
                  { value: "high", label: "高" },
                  { value: "mid", label: "中" },
                  { value: "low", label: "低" },
                ]}
                placeholder="優先度を選択"
              />
            </FormField>
          </Labeled>
          <Labeled label="horizontal">
            <FormField label="優先度" required orientation="horizontal">
              <Select
                items={[
                  { value: "high", label: "高" },
                  { value: "mid", label: "中" },
                  { value: "low", label: "低" },
                ]}
                placeholder="優先度を選択"
              />
            </FormField>
          </Labeled>
          <Labeled label="responsive（狭い画面で縦、広い画面で横）">
            <FormField label="優先度" required orientation="responsive">
              <Select
                items={[
                  { value: "high", label: "高" },
                  { value: "mid", label: "中" },
                  { value: "low", label: "低" },
                ]}
                placeholder="優先度を選択"
              />
            </FormField>
          </Labeled>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。ラベルをクリックすると入力欄にフォーカスが移る。 */
export const Default: Story = {};

/** 必須項目。`*` は視覚用、`（必須）` は読み上げ用に出力される。 */
export const Required: Story = {
  args: { required: true },
};

/** 補足説明付き。入力前に伝えたい制約はここに書く。 */
export const WithHelpText: Story = {
  args: {
    required: true,
    helpText: "50 文字以内で入力してください",
  },
};

/**
 * エラー状態。
 *
 * `error` を渡すだけで、子の `Input` が赤枠になり `aria-invalid` が付き、
 * メッセージが `role="alert"` で読み上げられる。
 */
export const WithError: Story = {
  args: {
    label: "メールアドレス",
    required: true,
    error: "メールアドレスの形式が正しくありません",
    children: <Input defaultValue="foo@" />,
  },
};

/**
 * エラーとヘルプの両方。
 *
 * エラーが上、ヘルプが下に並ぶ。**ヘルプは消さない**
 * （入力ルールは、間違えた直後こそ必要な情報）。
 */
export const WithErrorAndHelpText: Story = {
  args: {
    label: "パスワード",
    required: true,
    error: "パスワードが短すぎます",
    helpText: "8 文字以上、英字と数字を含めてください",
    children: <Input type="password" defaultValue="abc" />,
  },
};

/** `Select` と組み合わせる例。 */
export const WithSelect: Story = {
  args: {
    label: "優先度",
    required: true,
    helpText: "後から変更できます",
    children: (
      <Select
        items={[
          { value: "high", label: "高" },
          { value: "mid", label: "中" },
          { value: "low", label: "低" },
        ]}
        placeholder="優先度を選択"
      />
    ),
  },
};

/**
 * `textarea` と組み合わせる例。
 *
 * React 版の textarea コンポーネントは未提供なので素の要素を使う。
 * `id` / `aria-describedby` は `FormField` が注入するが、
 * **赤枠は付かない**ため、エラー時のスタイルは自分で当てる。
 */
export const WithTextarea: Story = {
  args: {
    label: "詳細",
    helpText: "Markdown が使えます",
    children: (
      <textarea
        rows={4}
        placeholder="申請の理由を記入してください"
        className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
      />
    ),
  },
};

/**
 * フォーム全体の組み立て。
 *
 * **縦の間隔は各項目に `mb-*` を付けず、親の `space-y-4` で制御する。**
 * ボタンは区切り線の下、キャンセルが左・主アクションが右。
 */
export const FullForm: Story = {
  render: () => (
    <form className="space-y-4">
      <FormField label="件名" required helpText="50 文字以内で入力してください">
        <Input placeholder="例: 備品購入の申請" required />
      </FormField>

      <FormField label="優先度" required>
        <Select
          items={[
            { value: "high", label: "高" },
            { value: "mid", label: "中" },
            { value: "low", label: "低" },
          ]}
          placeholder="優先度を選択"
          required
        />
      </FormField>

      <FormField label="金額" required error="金額を入力してください">
        <Input type="number" placeholder="0" min={0} />
      </FormField>

      <FormField label="備考" helpText="任意">
        <Input placeholder="補足があれば記入してください" />
      </FormField>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button variant="secondary" type="button">
          キャンセル
        </Button>
        <Button variant="primary" type="submit">
          申請する
        </Button>
      </div>
    </form>
  ),
};
