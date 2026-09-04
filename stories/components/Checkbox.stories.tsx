import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Button, Checkbox } from "../../components/application";
import { Section, Showcase, Stack } from "../_showcase";

/**
 * Checkbox はオン / オフを切り替えるためのコンポーネント。
 *
 * <important>
 * ラベルは `label` prop で渡す。ラベルをクリックしてもトグルできるようになる
 * （チェックボックス本体は 16px 程度しかなく、押しにくいため）。
 * </important>
 */
const meta = {
  title: "コンポーネント/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

チェックボックスとラベルの紐づけ（\`id\` / \`htmlFor\`）を自動化し、
クリック領域の確保とアクセシビリティを毎回書かずに済むようにする。

## 使う場面

- 単独のオン / オフ（利用規約への同意、通知の受け取り）
- 複数選択のリスト（対象の絞り込み、権限の付与）
- 一覧の行選択 + ヘッダーの「すべて選択」（\`indeterminate\`）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| テンプレート（.html） | \`<input type="checkbox">\`（即時反映の ON/OFF なら \`class="switch"\`） |
| 排他的な選択（どれか 1 つ） | ラジオボタン。チェックボックスは「複数選べる」と読まれる |
| 選択肢が多い（十数個以上） | \`Select\` か検索できる UI |
| 即座に設定が反映される ON/OFF | \`Switch\` |

## Props

\`@base-ui/react\` の Checkbox の props をそのまま受け取れる
（\`checked\` / \`defaultChecked\` / \`onCheckedChange\` / \`indeterminate\` / \`disabled\` / \`name\` / \`required\`）。
加えて \`label\` / \`description\` / \`wrapperClassName\` を持つ。

## 注意事項

- **\`label\` と \`description\` を両方省略すると、素のチェックボックスだけを返す。**
  その場合は呼び出し側で \`aria-label\` を付けること（何のチェックか伝わらない）
- \`description\` は \`aria-describedby\` で紐づく。補足は \`label\` に詰め込まず
  \`description\` に分けたほうが読み上げが自然になる
- **チェックボックスは押した瞬間に保存しない**のが原則。
  複数の変更をまとめて「保存」ボタンで確定する
  （即時反映が必要なら、その旨を \`description\` に明記する）
- \`indeterminate\` は「一部だけ選択されている」状態を表す。
  自動では解除されないので、アプリ側で選択数に応じて計算する
        `,
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
  args: {
    label: "利用規約に同意する",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 状態の一覧。チェックボックスは小さいため、状態の差が読み取れるかをここで確認する。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="States"
        note="indeterminate は「子の一部だけが選択されている」ことを表す。単独では使わない。"
      >
        <Stack>
          <Checkbox label="未チェック" />
          <Checkbox label="チェック済み" defaultChecked />
          <Checkbox label="一部選択（indeterminate）" indeterminate />
          <Checkbox label="無効" disabled />
          <Checkbox label="無効かつチェック済み" disabled defaultChecked />
        </Stack>
      </Section>

      <Section
        title="With Description"
        note="補足はラベルに詰め込まず description に置く。ラベルは短く保つ。"
      >
        <Stack>
          <Checkbox
            label="メール通知を受け取る"
            description="申請の状態が変わったときに通知します。あとから設定画面で変更できます。"
          />
        </Stack>
      </Section>

      <Section title="親子の選択" note="親は子の状態に応じて checked / indeterminate を切り替える。">
        <Stack>
          <Checkbox label="すべて選択" indeterminate />
          <div className="ml-6 space-y-2.5">
            <Checkbox label="備品購入申請" defaultChecked />
            <Checkbox label="出張申請" />
            <Checkbox label="休暇申請" />
          </div>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。ラベルのクリックでもトグルできる。 */
export const Default: Story = {};

/** 初期状態でチェック済み。 */
export const Checked: Story = {
  args: { defaultChecked: true },
};

/**
 * 補足説明付き。
 *
 * `description` は `aria-describedby` で紐づくため、
 * スクリーンリーダーはラベルに続けて説明を読む。
 */
export const WithDescription: Story = {
  args: {
    label: "メール通知を受け取る",
    description: "重要な更新のみ送信されます。頻度は設定画面で変更できます。",
  },
};

/** 操作不可。 */
export const Disabled: Story = {
  args: { label: "変更できません", disabled: true },
};

/** 操作不可かつチェック済み（権限で固定されている場合など）。 */
export const DisabledChecked: Story = {
  args: { label: "管理者が有効化しています", disabled: true, defaultChecked: true },
};

/**
 * 一部選択状態（`indeterminate`）。
 *
 * 「すべて選択」のチェックボックスで、一部の行だけ選ばれているときに使う。
 * チェック済みでも未チェックでもない第 3 の状態。
 */
export const Indeterminate: Story = {
  args: { label: "すべて選択", indeterminate: true },
};

/**
 * `label` も `description` も渡さない場合。
 *
 * 素のチェックボックスだけが返る（wrapper なし）。
 * テーブルの行選択など、ラベルを視覚的に置けない場所で使う。
 * **`aria-label` を必ず付ける。**
 */
export const WithoutLabel: Story = {
  args: { label: undefined, "aria-label": "この行を選択" },
};

/**
 * 複数選択のリスト。
 *
 * 「すべて選択」の `indeterminate` を選択数から計算する例。
 * 変更は即時保存せず、「保存」ボタンで確定する。
 */
export const MultiSelectList: Story = {
  render: () => {
    const OPTIONS = ["営業部", "総務部", "開発部", "品質管理課"];
    const [selected, setSelected] = React.useState<string[]>(["営業部"]);

    const allChecked = selected.length === OPTIONS.length;
    const someChecked = selected.length > 0 && !allChecked;

    const toggle = (name: string, checked: boolean) =>
      setSelected((prev) => (checked ? [...prev, name] : prev.filter((n) => n !== name)));

    return (
      <div className="max-w-md space-y-3">
        <Checkbox
          label="すべて選択"
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={(checked) => setSelected(checked ? [...OPTIONS] : [])}
          className="font-medium"
        />

        <div className="space-y-2 border-t border-border pt-3 pl-1">
          {OPTIONS.map((name) => (
            <Checkbox
              key={name}
              label={name}
              checked={selected.includes(name)}
              onCheckedChange={(checked) => toggle(name, checked)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">{selected.length} 件を選択中</p>
          <Button variant="primary" size="sm" disabled={selected.length === 0}>
            保存
          </Button>
        </div>
      </div>
    );
  },
};