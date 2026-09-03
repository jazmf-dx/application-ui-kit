import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Button,
  FormField,
  TreeSelect,
  type TreeSelectItem,
} from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

/**
 * 組織のような「所属の位置関係を見せたい」階層。
 * badge には部署長のような 1 行の補足を入れる。
 */
const UNITS: TreeSelectItem[] = [
  {
    value: "hq",
    label: "本社",
    children: [
      { value: "sales", label: "営業部", badge: "田中" },
      { value: "admin", label: "総務部", badge: "佐藤" },
      {
        value: "it",
        label: "情報システム部",
        badge: "鈴木",
        children: [
          { value: "core", label: "基幹システム課" },
          { value: "infra", label: "インフラ課" },
          { value: "helpdesk", label: "ヘルプデスク課", disabled: true },
        ],
      },
    ],
  },
  {
    value: "factory",
    label: "工場",
    children: [
      { value: "line1", label: "第一製造課" },
      { value: "line2", label: "第二製造課" },
      { value: "qa", label: "品質管理課" },
    ],
  },
  { value: "branch", label: "大阪支店" },
];

/** 末端だけが意味を持つ分類。中間ノードは通り道でしかない。 */
const CATEGORIES: TreeSelectItem[] = [
  {
    value: "expense",
    label: "経費",
    children: [
      { value: "travel", label: "旅費交通費" },
      { value: "supplies", label: "消耗品費" },
      { value: "entertainment", label: "交際費" },
    ],
  },
  {
    value: "asset",
    label: "資産",
    children: [
      { value: "pc", label: "PC・周辺機器" },
      { value: "furniture", label: "什器" },
    ],
  },
];

/**
 * TreeSelect は階層構造から 1 つ選ぶためのコンポーネント。
 *
 * <important>
 * ドメインを持たない汎用部品として置いている。部署・組織・拠点のような
 * マスタ由来の選択は、マスタを所有するプロジェクトが `items` を組み立てて渡す。
 * </important>
 */
const meta = {
  title: "コンポーネント/TreeSelect",
  component: TreeSelect,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

階層構造を **たどって** 1 つ選ぶ操作を統一する。
親をホバー / フォーカスすると子階層が右隣の列に開く（macOS のメニューと同じ挙動）。

選んだ結果だけでなく **どこに属するか** を見せたい場合のためにある。
トリガーには既定でルートからの経路（\`本社 / 情報システム部 / 基幹システム課\`）が出る。

## 使う場面

- 組織図・分類ツリーのように、階層の位置関係そのものが選択の手がかりになる場合
- 階層が浅く（2〜4 段）、各階層の項目数が一覧で見える程度の場合

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 選択肢がフラットで十数個まで | \`Select\` |
| 件数が多く「名前で検索して 1 つ選ぶ」 | \`Combobox\` |
| 複数選択したい | \`Combobox\` の \`multiple\` |
| 階層を編集・並べ替えしたい | ツリービュー。これは選択専用 |

## ドメインとの境界

<important>
このコンポーネントはツリーを \`items\` で丸ごと受け取るだけで、データ取得を一切しない。
社員・組織・拠点のような業務ドメインの選択 UI は、
そのドメインを所有するプロジェクトが持つ（Application UI Standard §6 Domain Components）。
マスタの取得・認証・CSRF・エンドポイントをこのコンポーネントへ入れないこと。
入れた時点で、利用側すべてがその連携を引き受けることになる。
</important>

所有プロジェクト側は、API から取ったツリーを \`TreeSelectItem[]\` に変換して渡す。

\`\`\`tsx
// ドメインを所有するプロジェクト側の薄いラッパー
export function DepartmentSelect({ name, value, onValueChange }: Props) {
  const departments = useDepartments()  // ← 取得はドメイン側の責務
  return (
    <TreeSelect
      items={departments}
      name={name}
      value={value}
      onValueChange={onValueChange}
      leafOnly
      aria-label="部署"
    />
  )
}
\`\`\`

## Props

\`\`\`ts
type TreeSelectItem = {
  value: string        // 選択時の値。ツリー全体で一意
  label: string        // 表示ラベル
  badge?: string       // ラベルの右に出す補足（部署長・コード・件数）
  disabled?: boolean   // 選択不可。子の展開は可能
  children?: TreeSelectItem[]
}
\`\`\`

## 注意事項

- **ラベルが必須。** トリガーは \`role="combobox"\` になるため、\`placeholder\` や選択中の値が
  あってもアクセシブルな名前は付かない。\`FormField\` で囲むか
  \`aria-label\` / \`aria-labelledby\` を渡す
- **\`value\` はツリー全体で一意にする。** 経路探索は最初に一致したノードで打ち切る
- \`leafOnly\` は「中間ノードを選ばせない」だけで、展開は引き続きできる
- \`maxLevels\`（既定 4）より深い階層は開かない。横スクロールが必要になる前に打ち切るための上限
- 開いた直後は選択済みの階層が開いた状態になる。未選択なら先頭の項目にフォーカスが当たる
- \`name\` を渡すとフォーム送信用の \`input[type=hidden]\` が出る（Django のフォームへ島として差し込む場合）
- キーボード操作: \`↑\`\`↓\` で列内を移動、\`→\` で子階層へ、\`←\` で親階層へ、\`Esc\` で閉じる
        `,
      },
    },
  },
  argTypes: {
    items: { table: { disable: true } },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    leafOnly: { control: "boolean" },
    showPath: { control: "boolean" },
    maxLevels: { control: { type: "number", min: 1, max: 6 } },
    placeholder: { control: "text" },
  },
  args: {
    items: UNITS,
    placeholder: "組織を選択",
    // combobox は中身の文字列を名前にできない（上の「注意事項」参照）。
    "aria-label": "組織",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TreeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 状態と主なオプションを 1 画面で比較する。
 *
 * 階層をたどらせる必然性が無いなら `Select` / `Combobox` を使う。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="States"
        note="placeholder はラベルの代わりにならない。ラベルは別に置く。"
      >
        <Stack>
          <Labeled label="未選択（placeholder）">
            <TreeSelect items={UNITS} placeholder="組織を選択" aria-label="未選択" />
          </Labeled>
          <Labeled label="選択済み（経路表示）">
            <TreeSelect items={UNITS} value="core" aria-label="選択済み" />
          </Labeled>
          <Labeled label="エラー">
            <TreeSelect items={UNITS} error placeholder="組織を選択" aria-label="エラー" />
          </Labeled>
          <Labeled label="操作不可">
            <TreeSelect items={UNITS} value="sales" disabled aria-label="操作不可" />
          </Labeled>
        </Stack>
      </Section>

      <Section
        title="showPath"
        note="経路まで出すか、末端だけ出すか。列幅が狭い一覧では末端だけにする。"
      >
        <Stack>
          <Labeled label="showPath（既定）">
            <TreeSelect items={UNITS} value="core" aria-label="経路あり" />
          </Labeled>
          <Labeled label="末端のみ">
            <TreeSelect items={UNITS} value="core" showPath={false} aria-label="末端のみ" />
          </Labeled>
        </Stack>
      </Section>

      <Section
        title="leafOnly"
        note="中間ノードが通り道でしかない分類では leafOnly にする。展開は引き続きできる。"
      >
        <Stack>
          <Labeled label="中間ノードも選べる（既定）">
            <TreeSelect items={CATEGORIES} placeholder="勘定科目を選択" aria-label="科目" />
          </Labeled>
          <Labeled label="末端だけ選べる">
            <TreeSelect
              items={CATEGORIES}
              leafOnly
              placeholder="勘定科目を選択"
              aria-label="科目（末端のみ）"
            />
          </Labeled>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/**
 * 実際のフォームでの使い方。ラベルとエラーメッセージは `FormField` が持つ。
 */
export const InFormField: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [unit, setUnit] = React.useState<string | null>(null);
    return (
      <Stack>
        <FormField
          label="所属"
          required
          error={unit ? undefined : "所属を選択してください"}
        >
          <TreeSelect
            items={UNITS}
            name="unit"
            value={unit}
            onValueChange={setUnit}
            error={!unit}
            placeholder="組織を選択"
            required
          />
        </FormField>
      </Stack>
    );
  },
};

/**
 * ネイティブのフォーム検証（`<form>` + `required` + `type="submit"`）。
 *
 * 未選択のまま送信すると、ブラウザ既定の挙動（`aria-hidden` な送信用 input への
 * フォーカスと吹き出し）を止め、**可視のトリガーへフォーカス**して
 * `aria-invalid` とエラー文言を紐づける。送信自体はブロックされたまま。
 *
 * 呼び出し側が `FormField error` で文言を出している場合は
 * 文言を重ねず、フォーカスと `aria-invalid` だけを引き受ける。
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
      <FormField label="所属" required>
        <TreeSelect items={UNITS} name="unit" placeholder="組織を選択" required />
      </FormField>
      <Button type="submit">送信</Button>
    </form>
  ),
};

/**
 * Controls から props を切り替えて挙動を確かめる。
 */
export const Playground: Story = {};
