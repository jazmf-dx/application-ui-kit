import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  FieldSet,
  RadioGroup,
  type RadioGroupItem,
} from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

const PRIORITIES: RadioGroupItem[] = [
  { value: "high", label: "高" },
  { value: "mid", label: "中" },
  { value: "low", label: "低" },
];

/** cards は「説明」と「右端の補足」があって初めて意味を持つ。 */
const SHIPPING: RadioGroupItem[] = [
  { value: "standard", label: "通常配送", description: "3〜5営業日でお届け", meta: "無料" },
  { value: "express", label: "速達", description: "翌営業日にお届け", meta: "550円" },
  {
    value: "pickup",
    label: "店舗受取",
    description: "取り扱い店舗が近くにありません",
    meta: "無料",
    disabled: true,
  },
];

/**
 * RadioGroup は排他的な選択（どれか1つ）を表すコンポーネント。
 *
 * <important>
 * チェックボックスと違い「複数選べる」と読まれない。選択肢が相互排他のときは
 * 必ずこちらを使う。
 * </important>
 */
const meta = {
  title: "コンポーネント/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

排他的な選択（どれか1つ）をチェックボックスと区別して提供する。

## 使う場面

- 選択肢が **2〜5個** で、常に画面に見せておきたい場合（優先度・区分）
- 「その他」など補足入力が伴う選択

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 選択肢が 2 つで、片方が既定の ON/OFF | \`Checkbox\`（1 クリックで済む） |
| 選択肢が多い（6個以上） | \`Select\`（省スペース） |
| 複数選択したい | \`Checkbox\` のリスト |
| ボタンの並びとして見せたい（表示切替・期間選択など） | \`ButtonGroup\` |
| 候補を複数の属性（人数・金額など）で並べて比較させたい | \`RadioTable\` |

## Props

選択肢は JSX の子要素ではなく **\`items\` 配列**で渡す（\`Select\` と同じ方針）。

## variant

| variant | 使う場面 |
|---|---|
| \`list\`（既定） | 選択肢が短く、説明が要らない・1行で足りる |
| \`cards\` | 説明や右端の補足（金額・容量）を見比べて決める。クリック領域をカード全体に広げる |

\`cards\` は見た目の飾りではなく「比較して選ぶ」ための形。説明も補足も無いのに
\`cards\` にすると、枠が増えるだけで読み取れる情報は増えない。

## 注意事項

- \`orientation="horizontal"\` は選択肢が短い文言のときのみ使う（折り返すと読みにくい）
- ラベル・エラー表示は \`FieldSet\` で囲む（\`FormField\` は\n  単一のコントロール用。グループへ使うと \`<label for>\` が効かず名前が付かない）
- グループ全体の \`name\` を渡すとフォーム送信に含められる
        `,
      },
    },
  },
  argTypes: {
    items: { table: { disable: true } },
    variant: { control: "radio", options: ["list", "cards"] },
    orientation: { control: "radio", options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
  },
  args: {
    items: PRIORITIES,
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 並び方向と状態を 1 画面で比較する。
 *
 * 選択肢が 5 個を超えるときは `Select` を検討する
 * （縦に伸びて画面を占有するため）。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="Orientation"
        note="既定は vertical。ラベルが短く選択肢が 3 個程度のときだけ horizontal にする。"
      >
        <Stack className="max-w-md">
          <Labeled label="vertical（既定）">
            <RadioGroup items={PRIORITIES} defaultValue="mid" />
          </Labeled>
          <Labeled label="horizontal">
            <RadioGroup items={PRIORITIES} defaultValue="mid" orientation="horizontal" />
          </Labeled>
        </Stack>
      </Section>

      <Section
        title="Variant"
        note="cards は「説明や金額を見比べて決める」ときだけ。飾りとして枠を増やさない。"
      >
        <Stack className="max-w-xl">
          <Labeled label='variant="list"（既定）'>
            <RadioGroup items={SHIPPING} defaultValue="standard" />
          </Labeled>
          <Labeled label='variant="cards"'>
            <RadioGroup variant="cards" items={SHIPPING} defaultValue="standard" />
          </Labeled>
          <Labeled label='variant="cards" + orientation="horizontal"'>
            <RadioGroup
              variant="cards"
              orientation="horizontal"
              items={SHIPPING}
              defaultValue="standard"
            />
          </Labeled>
        </Stack>
      </Section>

      <Section title="With Description" note="選択の判断に必要な補足は description に置く。">
        <Stack className="max-w-md">
          <RadioGroup
            items={[
              {
                value: "all",
                label: "全員に公開",
                description: "社内の全ユーザーが閲覧できます",
              },
              {
                value: "dept",
                label: "部署内に公開",
                description: "所属部署のユーザーだけが閲覧できます",
              },
              { value: "private", label: "非公開", description: "自分だけが閲覧できます" },
            ]}
            defaultValue="dept"
          />
        </Stack>
      </Section>

      <Section title="States" note="選択肢単位の無効化と、グループ全体の無効化。">
        <Stack className="max-w-md">
          <Labeled label="選択肢の一部を無効化">
            <RadioGroup
              items={[
                { value: "draft", label: "下書き" },
                { value: "published", label: "公開" },
                { value: "archived", label: "アーカイブ（権限なし）", disabled: true },
              ]}
              defaultValue="draft"
            />
          </Labeled>
          <Labeled label="グループ全体を無効化">
            <RadioGroup items={PRIORITIES} defaultValue="mid" disabled />
          </Labeled>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形（縦並び）。 */
export const Default: Story = {
  args: { defaultValue: "mid" },
};

/** 横並び。選択肢の文言が短いときに使う。 */
export const Horizontal: Story = {
  args: { orientation: "horizontal", defaultValue: "mid" },
};

/** 補足説明付き。 */
export const WithDescription: Story = {
  args: {
    items: [
      { value: "public", label: "公開", description: "誰でも閲覧できます" },
      { value: "internal", label: "shared限定", description: "sharedメンバーのみ閲覧できます" },
      { value: "private", label: "非公開", description: "自分のみ閲覧できます" },
    ],
    defaultValue: "internal",
  },
};

/**
 * カード。説明と右端の補足（金額・容量）を見比べて決めるとき。
 *
 * クリック領域はカード全体。読み上げ名はラベルだけで、description は
 * `aria-describedby` に回している（カード全部が名前として読まれないように）。
 */
export const Cards: Story = {
  args: { variant: "cards", items: SHIPPING, defaultValue: "standard" },
};

/** カードの横並び。3〜4件までにする（折り返すと比較しにくい）。 */
export const CardsHorizontal: Story = {
  args: {
    variant: "cards",
    orientation: "horizontal",
    items: SHIPPING,
    defaultValue: "standard",
  },
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
  },
};

/** 操作不可（グループ全体）。 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "mid" },
};

/**
 * 制御コンポーネントとして使う場合。
 */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("mid");
    return (
      <div className="space-y-3">
        <RadioGroup {...args} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground">
          選択中の値: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{value}</code>
        </p>
      </div>
    );
  },
};

/**
 * `FieldSet` と組み合わせた実際の使い方。
 *
 * グループには `<label for>` が効かないため、名前は `aria-labelledby` で結ぶ。
 * `FormField` を使うとラベルはあるのにアクセシブル名が無い状態になる。
 */
export const WithFormField: Story = {
  render: () => (
    <FieldSet label="優先度" required helpText="後から変更できます">
      <RadioGroup items={PRIORITIES} name="priority" defaultValue="mid" />
    </FieldSet>
  ),
};
