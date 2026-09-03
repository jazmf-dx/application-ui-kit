import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayoutGrid, List, Rows3 } from "lucide-react";
import * as React from "react";
import {
  Button,
  ButtonGroup,
  type ButtonGroupItem,
  FieldSet,
} from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

const PERIODS: ButtonGroupItem[] = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
];

/**
 * ButtonGroup は排他的な選択（どれか1つ）を、隣接したボタンの並び
 * （segmented control）として表現するコンポーネント。
 *
 * <important>
 * 内部的には `RadioGroup` と同じくラジオボタン。「複数選べる」ようには見えるが
 * 実際には 1 つしか選べないため、複数選択が必要な場面では使わない。
 * </important>
 */
const meta = {
  title: "コンポーネント/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

排他的な選択を、常に全選択肢が見えるボタンの並びとして提供する。
見た目のボタングループだが、選択の意味は \`RadioGroup\` と同じ（どれか1つ）。

## 使う場面

- 選択肢が **2〜5個** で、選んだ結果を常に見せておきたい表示切替（一覧 / グリッド、日 / 週 / 月）
- 各選択肢を短いラベルやアイコンだけで表せる場合

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 選択肢が多い（6個以上） | \`Select\`（省スペース） |
| 複数選択したい | \`Checkbox\` のリスト |
| 補足説明を選択肢ごとに添えたい | \`RadioGroup\`（縦に並ぶ分、説明文を置ける） |
| ページ内のコンテンツ切り替え（タブ） | \`Tabs\` |

## Props

選択肢は JSX の子要素ではなく **\`items\` 配列**で渡す（\`Select\` と同じ方針）。
\`variant\`（\`primary\` / \`secondary\`）と \`size\`（\`sm\` / \`md\` / \`lg\`）でカスタマイズできる。

## 注意事項

- 視覚的なラベルが画面上にない場合は **\`aria-label\` が必須**（何を選ぶボタン列か伝わらない）
- ラベル・エラー表示は \`FieldSet\` で囲む（\`FormField\` は\n  単一のコントロール用。グループへ使うと \`<label for>\` が効かず名前が付かない）
- \`name\` を渡すとフォーム送信に含められる
        `,
      },
    },
  },
  argTypes: {
    items: { table: { disable: true } },
    variant: { control: "radio", options: ["primary", "secondary"] },
    size: { control: "radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
  args: {
    items: PERIODS,
    "aria-label": "表示期間",
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * variant / size / 状態を 1 画面で比較する。
 *
 * 選択肢が 4 個を超える、またはラベルが長いときは
 * `RadioGroup` か `Select` を使う（横幅が破綻する）。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="Variants" note="選択中を primary の塗りで示すか、控えめな塗りで示すかの違い。">
        <Stack className="max-w-md">
          <Labeled label="primary（既定）">
            <ButtonGroup items={PERIODS} defaultValue="week" aria-label="期間" />
          </Labeled>
          <Labeled label="secondary">
            <ButtonGroup
              items={PERIODS}
              defaultValue="week"
              variant="secondary"
              aria-label="期間（secondary）"
            />
          </Labeled>
        </Stack>
      </Section>

      <Section title="Sizes" note="ツールバー内は sm。既定は md。">
        <Stack className="max-w-md">
          <Labeled label="sm">
            <ButtonGroup
              items={PERIODS}
              defaultValue="week"
              size="sm"
              aria-label="期間（sm）"
            />
          </Labeled>
          <Labeled label="md（既定）">
            <ButtonGroup
              items={PERIODS}
              defaultValue="week"
              size="md"
              aria-label="期間（md）"
            />
          </Labeled>
          <Labeled label="lg">
            <ButtonGroup
              items={PERIODS}
              defaultValue="week"
              size="lg"
              aria-label="期間（lg）"
            />
          </Labeled>
        </Stack>
      </Section>

      <Section title="With Icons" note="アイコンだけにしない。表示形式の切替のように意味が明確な場合も文字を残す。">
        <Stack className="max-w-md">
          <ButtonGroup
            items={[
              { value: "list", label: "リスト", icon: <List /> },
              { value: "rows", label: "行表示", icon: <Rows3 /> },
              { value: "grid", label: "グリッド", icon: <LayoutGrid /> },
            ]}
            defaultValue="list"
            aria-label="表示形式"
          />
        </Stack>
      </Section>

      <Section title="States" note="選択肢単位の無効化と、グループ全体の無効化。">
        <Stack className="max-w-md">
          <Labeled label="選択肢の一部を無効化">
            <ButtonGroup
              items={[
                { value: "draft", label: "下書き" },
                { value: "published", label: "公開" },
                { value: "archived", label: "アーカイブ", disabled: true },
              ]}
              defaultValue="draft"
              aria-label="公開状態"
            />
          </Labeled>
          <Labeled label="グループ全体を無効化">
            <ButtonGroup
              items={PERIODS}
              defaultValue="week"
              disabled
              aria-label="期間（無効）"
            />
          </Labeled>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {
  args: { defaultValue: "week" },
};

/** アイコン付き選択肢。 */
export const WithIcons: Story = {
  args: {
    items: [
      { value: "list", label: "リスト", icon: <List /> },
      { value: "rows", label: "行表示", icon: <Rows3 /> },
      { value: "grid", label: "グリッド", icon: <LayoutGrid /> },
    ],
    defaultValue: "list",
    "aria-label": "表示形式",
  },
};

/** secondary バリアント。選択中を控えめな塗りで示す。 */
export const Secondary: Story = {
  args: { variant: "secondary", defaultValue: "week" },
};

/** 一部の選択肢を無効化した例（権限で選べない場合等）。 */
export const WithDisabledItem: Story = {
  args: {
    items: [
      { value: "draft", label: "下書き" },
      { value: "published", label: "公開" },
      { value: "archived", label: "アーカイブ（権限なし）", disabled: true },
    ],
    defaultValue: "draft",
    "aria-label": "公開状態",
  },
};

/** 操作不可（グループ全体）。 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "week" },
};

/**
 * 制御コンポーネントとして使う場合。
 */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("week");
    return (
      <div className="space-y-3">
        <ButtonGroup {...args} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground">
          選択中の値: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{value}</code>
        </p>
      </div>
    );
  },
};

/**
 * `FieldSet` と組み合わせた実際の使い方（グループなので FormField ではない）。
 */
export const WithFormField: Story = {
  render: () => (
    <FieldSet label="表示期間" required helpText="後から変更できます">
      <ButtonGroup items={PERIODS} name="period" defaultValue="week" />
    </FieldSet>
  ),
};

/**
 * ネイティブのフォーム検証（`<form>` + `required` + `type="submit"`）。
 *
 * 未選択のまま送信すると、ブラウザ既定の挙動（`aria-hidden` な送信用 input への
 * フォーカスと吹き出し）を止め、**可視のボタンへフォーカス**して
 * `aria-invalid` とエラー文言を紐づける。送信自体はブロックされたまま。
 */
export const NativeValidation: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <form
      className="max-w-md space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        alert("送信しました");
      }}
    >
      <FieldSet label="表示期間" required>
        <ButtonGroup items={PERIODS} name="period" required aria-label="表示期間" />
      </FieldSet>
      <Button type="submit">送信</Button>
    </form>
  ),
};
