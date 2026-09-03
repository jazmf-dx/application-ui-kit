import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FormField, Select, type SelectItem } from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

const PRIORITIES: SelectItem[] = [
  { value: "high", label: "高" },
  { value: "mid", label: "中" },
  { value: "low", label: "低" },
];

const STATUSES: SelectItem[] = [
  { value: "new", label: "未対応" },
  { value: "in_progress", label: "対応中" },
  { value: "review", label: "確認中" },
  { value: "done", label: "完了" },
  { value: "closed", label: "クローズ", disabled: true },
];

const DEPARTMENTS: SelectItem[] = [
  { value: "sales", label: "営業部", group: "本社" },
  { value: "admin", label: "総務部", group: "本社" },
  { value: "dev", label: "開発部", group: "本社" },
  { value: "line1", label: "第一製造課", group: "工場" },
  { value: "line2", label: "第二製造課", group: "工場" },
  { value: "qa", label: "品質管理課", group: "工場" },
];

/**
 * Select は選択肢から 1 つ選ぶためのコンポーネント。
 *
 * <important>
 * 選択肢が十数個を超える、または検索が必要な場合は使わない。
 * React 側は Combobox、テンプレート側はネイティブの `<select>` を使う。
 * </important>
 */
const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

選択肢から 1 つ選ぶ操作を統一する。
見た目は application の \`select.input-field\`（矢印アイコン付き）に揃えてある。

素の \`<select>\` ではなく \`@base-ui/react\` の Select を使っている理由は、
OS 標準のドロップダウンではグループ見出しや無効項目の見た目が揃わず、
またダークモードで OS 側の配色が混ざるため。

## 使う場面

- 選択肢が **2〜十数個** で固定されている場合（ステータス・優先度・区分）
- 選択肢を一覧で見せたい場合

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| テンプレート（.html） | \`<select class="input-field">\` |
| 選択肢が多い / 検索が必要（社員・部署・取引先） | \`Combobox\`（React） / ネイティブの \`<select>\`（テンプレート） |
| 選択肢が 2 つで排他 | \`Checkbox\` かラジオボタン（1 クリックで済む） |
| 複数選択したい | \`Combobox\` の \`multiple\`、または少数ならチェックボックスのリスト |
| 日付を選ぶ | \`DatePicker\` |

## Props

選択肢は JSX の子要素ではなく **\`items\` 配列**で渡す。
配列にしている理由は、application の \`choices\` や API のレスポンスを
そのまま \`map\` で渡せるようにするため。

\`\`\`ts
type SelectItem = {
  value: string       // 選択時の値
  label: string       // 表示ラベル
  disabled?: boolean  // 選択不可
  group?: string      // グループ見出し（同じ文字列が続く項目がまとまる）
}
\`\`\`

## 注意事項

- **ラベルが必須。** トリガーは \`role="combobox"\` になる。ARIA はこのロールに
  「中身の文字列を名前として使う」ことを認めていないため、\`placeholder\` や
  選択中の値があってもアクセシブルな名前は付かない（axe の \`button-name\` 違反になる）。
  \`FormField\` で囲めばラベルが名前になる。単体で置くときは \`aria-label\` か
  \`aria-labelledby\` を渡す
- **\`placeholder\` は未選択状態の表示に使う。** 「選択してください」は選択肢ではないため、
  \`items\` に空の項目を入れないこと
- 必須項目で未選択を許さない場合は \`required\` を渡す
- \`group\` は **items の並び順のまま**まとめられる。同じグループを離して並べると
  見出しが 2 回出るので、グループごとに連続させる
- \`error\` は枠線の色だけを変える。メッセージは \`FormField\` で表示する
- キーボード操作: \`Enter\`/\`Space\` で開く、矢印で移動、文字入力で先頭一致ジャンプ、\`Esc\` で閉じる
        `,
      },
    },
  },
  argTypes: {
    items: { table: { disable: true } },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    items: PRIORITIES,
    placeholder: "優先度を選択",
    // combobox は中身の文字列を名前にできない（下の「注意事項」参照）。
    // 実画面では FormField のラベルが名前になるため aria-label は不要。
    "aria-label": "優先度",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 状態とグループ分けを 1 画面で比較する。
 *
 * 選択肢が 8 個を超えるときは `Combobox`（絞り込み付き）を検討する。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="States" note="placeholder はラベルの代わりにならない。ラベルは別に置く。">
        <Stack>
          <Labeled label="未選択（placeholder）">
            <Select items={PRIORITIES} placeholder="優先度を選択" aria-label="未選択" />
          </Labeled>
          <Labeled label="選択済み">
            <Select items={PRIORITIES} defaultValue="high" aria-label="選択済み" />
          </Labeled>
          <Labeled label="エラー">
            <Select items={PRIORITIES} error placeholder="優先度を選択" aria-label="エラー" />
          </Labeled>
          <Labeled label="無効">
            <Select items={PRIORITIES} disabled defaultValue="low" aria-label="無効" />
          </Labeled>
        </Stack>
      </Section>

      <Section
        title="Items"
        note="選択肢そのものを無効にできる（権限で選べない等）。理由はラベルに書く。"
      >
        <Stack>
          <Labeled label="選択肢の一部を無効化">
            <Select items={STATUSES} defaultValue="new" aria-label="ステータス" />
          </Labeled>
          <Labeled label="group でまとめる">
            <Select items={DEPARTMENTS} placeholder="部署を選択" aria-label="部署" />
          </Labeled>
        </Stack>
      </Section>

      <Section title="With Label" note="実装ではこの形が基本。">
        <Stack>
          <FormField label="優先度" required>
            <Select items={PRIORITIES} placeholder="優先度を選択" />
          </FormField>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。未選択時は `placeholder` が薄い文字で表示される。 */
export const Default: Story = {};

/** 初期値あり（非制御）。 */
export const WithDefaultValue: Story = {
  args: { defaultValue: "mid" },
};

/**
 * 制御コンポーネントとして使う場合。
 *
 * 選択に応じて他の項目を出し分けるなど、値をアプリ側で持つ必要があるときに使う。
 */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string>("new");
    return (
      <div className="space-y-3">
        <Select
          {...args}
          items={STATUSES}
          value={value}
          onValueChange={setValue}
          aria-label="ステータス"
        />
        <p className="text-sm text-muted-foreground">
          選択中の値: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{value}</code>
        </p>
      </div>
    );
  },
};

/**
 * 無効な選択肢を含む例。
 *
 * 「クローズ」は権限がない・前提条件を満たさない場合の表現。
 * **選択肢自体を消すか無効にするかは意味が違う。**
 * 消すと存在に気づけないため、存在は見せたいときは `disabled` を使う。
 */
export const WithDisabledItem: Story = {
  args: { items: STATUSES, placeholder: "ステータスを選択", "aria-label": "ステータス" },
};

/**
 * グループ分け。`item.group` に同じ文字列を付けた項目がまとまる。
 *
 * 選択肢が多く見えるが、**この規模（十数個）が上限**。
 * これを超えるなら検索できる UI に切り替える。
 */
export const Grouped: Story = {
  args: { items: DEPARTMENTS, placeholder: "部署を選択", "aria-label": "部署" },
};

/** エラー状態。実際の画面ではメッセージを必ず添える（次の Story を参照）。 */
export const Error: Story = {
  args: { error: true },
};

/** 操作不可。 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "mid" },
};

/**
 * `FormField` と組み合わせた実際の使い方。
 *
 * `error` を渡すと内側の `Select` にも自動で伝わる。
 */
export const WithFormField: Story = {
  render: () => (
    <div className="space-y-4">
      <FormField label="優先度" required helpText="後から変更できます">
        <Select items={PRIORITIES} placeholder="優先度を選択" />
      </FormField>

      <FormField label="担当部署" required error="担当部署を選択してください">
        <Select items={DEPARTMENTS} placeholder="部署を選択" />
      </FormField>
    </div>
  ),
};