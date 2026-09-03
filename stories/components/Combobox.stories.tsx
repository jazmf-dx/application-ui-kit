import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  COMBOBOX_CREATE_PREFIX,
  Combobox,
  type ComboboxItem,
  FormField,
  splitCreatedValues,
} from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

const SHOPS: ComboboxItem[] = [
  { value: "1", label: "渋谷店", badge: "128" },
  { value: "2", label: "新宿店", badge: "96" },
  { value: "3", label: "池袋店", badge: "84" },
  { value: "4", label: "上野店", badge: "52" },
  { value: "5", label: "品川店", badge: "41" },
  { value: "6", label: "横浜店", badge: "38" },
  { value: "7", label: "大宮店", badge: "22" },
  { value: "8", label: "千葉店", badge: "17" },
  { value: "9", label: "町田店", badge: "9" },
  { value: "10", label: "立川店", badge: "4", disabled: true },
];

const TAGS: ComboboxItem[] = [
  { value: "t1", label: "重要", badge: "31" },
  { value: "t2", label: "要確認", badge: "24" },
  { value: "t3", label: "保留", badge: "12" },
  { value: "t4", label: "再訪", badge: "8" },
];

/**
 * Combobox は、入力して絞り込みながら選ぶためのコンポーネント。
 *
 * <important>
 * 選択肢が十数個までで検索が要らない場合は Select を使う。
 * </important>
 */
const meta = {
  title: "コンポーネント/Combobox",
  component: Combobox,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

**選択肢が多くて一覧から探せない**場合に、入力で絞り込んで選べるようにする。
複数選択（チップ表示）と、一覧に無いものをその場で作る操作（\`creatable\`）を持つ。

見た目は \`Select\` と同じ枠（\`select.input-field\`）に揃えてある。
同じフォームに両方が並んでも段差が出ないようにするため。

## 使う場面

- 選択肢が **十数個を超える**（店舗・担当者・タグ・取引先）
- 入力して絞り込みたい
- 一覧に無いものをその場で追加したい（\`creatable\`）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 選択肢が 2〜十数個で固定 | \`Select\` |
| テンプレート（.html） | \`<select class="input-field">\` |
| 選択肢が 2 つで排他 | \`Checkbox\` かラジオボタン |
| 日付を選ぶ | \`DatePicker\` |

## Props

\`\`\`ts
type ComboboxItem = {
  value: string       // 選択時の値
  label: string       // 表示ラベル。絞り込みはこの文字列に対して行う
  badge?: string      // ラベルの右に小さく出す補足（件数・コード等）
  disabled?: boolean  // 選択不可
}
\`\`\`

**\`badge\` は絞り込みの対象にならない。** 「渋谷店（128件）」のように件数を
ラベルへ埋め込むと、\`128\` で検索したときに引っかかってしまう。
件数は \`badge\` に分けること。チップには出ない。

## 新規作成（creatable）

\`creatable\` を渡すと、入力した文字列が既存のラベルに無いとき
ドロップダウンの最後に「「○○」を新規作成」が出る。選ぶと選択値へ
\`__create__:○○\`（\`COMBOBOX_CREATE_PREFIX\`）が入る。

**モードの切り替えではなく選択肢として出す。** 「既存から選ぶ」と「新規に作る」を
排他のモードにすると、既存を 3 つ選んだうえで 1 つだけ新規に足す操作ができなくなるため。

既存の値と新規の名前は \`splitCreatedValues()\` で分ける。

\`\`\`ts
const { values, created } = splitCreatedValues(selected)
// values  → 既存の value（サーバーへ ID として送る）
// created → 新規作成された名前（サーバーで get_or_create する）
\`\`\`

## 注意事項

- **ラベルが必須。** 入力欄は \`role="combobox"\` になる。ARIA はこのロールに
  「中身の文字列を名前として使う」ことを認めていないため、\`placeholder\` があっても
  アクセシブルな名前は付かない。\`FormField\` で囲むか、
  \`aria-label\` / \`aria-labelledby\` を渡す
- **\`items\` は毎回同じ内容なら同じ配列を渡す必要はない**（内部で内容キーを見ている）が、
  中身が変わると入力中の文字列は選択値のラベルへ戻る。絞り込みのたびに
  \`items\` を差し替える設計（サーバー検索）にはしないこと
- \`error\` は枠線の色だけを変える。メッセージは \`FormField\` で表示する
- キーボード操作: \`↓\` で開く、矢印で移動、\`Enter\` で決定、\`Esc\` で閉じる。
  複数選択では \`Backspace\` で直前のチップを外せる
        `,
      },
    },
  },
  argTypes: {
    items: { table: { disable: true } },
    multiple: { control: "boolean" },
    creatable: { control: "boolean" },
    clearable: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    items: SHOPS,
    placeholder: "店舗を検索",
    "aria-label": "店舗",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 選択モードと状態を 1 画面で比較する。
 *
 * 選択肢が 8 個以下で絞り込みが不要なら `Select` を使う。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="Modes" note="単一選択・複数選択・新規作成つき。用途に応じて 1 つだけ選ぶ。">
        <Stack className="max-w-md">
          <Labeled label="単一選択（既定）">
            <Combobox items={SHOPS} placeholder="店舗を選択" aria-label="店舗" />
          </Labeled>
          <Labeled label="複数選択（multiple）">
            <Combobox
              items={TAGS}
              multiple
              defaultValue={["urgent"]}
              placeholder="タグを選択"
              aria-label="タグ"
            />
          </Labeled>
          <Labeled label="新規作成つき（creatable）">
            <Combobox
              items={TAGS}
              multiple
              creatable
              placeholder="タグを選択または入力"
              aria-label="タグ（新規作成つき）"
            />
          </Labeled>
          <Labeled label="クリアできる（clearable）">
            <Combobox
              items={SHOPS}
              clearable
              defaultValue={SHOPS[0].value}
              placeholder="店舗を選択"
              aria-label="店舗（クリア可）"
            />
          </Labeled>
        </Stack>
      </Section>

      <Section
        title="States"
        note="候補が 0 件のときは emptyMessage を出す。無言で閉じると壊れて見える。"
      >
        <Stack className="max-w-md">
          <Labeled label="候補なし（emptyMessage）">
            <Combobox
              items={[]}
              emptyMessage="該当する店舗がありません"
              placeholder="店舗を選択"
              aria-label="店舗（候補なし）"
            />
          </Labeled>
          <Labeled label="エラー">
            <Combobox
              items={SHOPS}
              error
              placeholder="店舗を選択"
              aria-label="店舗（エラー）"
            />
          </Labeled>
          <Labeled label="無効">
            <Combobox
              items={SHOPS}
              disabled
              defaultValue={SHOPS[0].value}
              placeholder="店舗を選択"
              aria-label="店舗（無効）"
            />
          </Labeled>
        </Stack>
      </Section>

      <Section title="With Label" note="実装ではこの形が基本。">
        <Stack className="max-w-md">
          <FormField label="店舗" required helpText="コードでも名前でも絞り込めます">
            <Combobox items={SHOPS} placeholder="店舗を選択" />
          </FormField>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。入力するとラベルで絞り込まれる。`badge` は絞り込みの対象にならない。 */
export const Default: Story = {};

/** 初期値あり（非制御）。 */
export const WithDefaultValue: Story = {
  args: { defaultValue: "2" },
};

/** 選択を消すボタンを出す。任意項目で使う。 */
export const Clearable: Story = {
  args: { clearable: true, defaultValue: "2" },
};

/**
 * 複数選択。選択済みはチップになり、`×` かフォーカス中の `Backspace` で外せる。
 */
export const Multiple: Story = {
  args: { items: TAGS, multiple: true, defaultValue: ["t1", "t3"], "aria-label": "タグ" },
};

/**
 * 新規作成つき。一覧に無い文字列を入力すると最後に「「○○」を新規作成」が出る。
 *
 * 既存の選択と混ぜられるのが要点で、`splitCreatedValues()` で送信前に分ける。
 */
export const Creatable: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(["t1"]);
    const { values, created } = splitCreatedValues(value);
    return (
      <div className="space-y-3">
        <Combobox
          {...args}
          items={TAGS}
          multiple
          creatable
          value={value}
          onValueChange={(next) => setValue(next as string[])}
          placeholder="タグを検索・追加"
          aria-label="タグ"
        />
        <dl className="space-y-1 text-sm text-muted-foreground">
          <div>
            既存: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{JSON.stringify(values)}</code>
          </div>
          <div>
            新規: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{JSON.stringify(created)}</code>
          </div>
        </dl>
      </div>
    );
  },
};

/** 新規作成の文言を差し替える例。 */
export const CreatableWithCustomLabel: Story = {
  args: {
    items: TAGS,
    creatable: true,
    "aria-label": "タグ",
    placeholder: "タグを検索・追加",
    formatCreateLabel: (query: string) => `+ ${query} を追加する`,
  },
};

/**
 * 制御コンポーネントとして使う場合。
 */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>("1");
    return (
      <div className="space-y-3">
        <Combobox
          {...args}
          value={value}
          onValueChange={(next) => setValue(next as string | null)}
        />
        <p className="text-sm text-muted-foreground">
          選択中の値:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{String(value)}</code>
        </p>
      </div>
    );
  },
};

/** 該当が無いときの表示。 */
export const Empty: Story = {
  args: { emptyMessage: "該当する店舗がありません" },
};

/** エラー状態。実際の画面ではメッセージを必ず添える（次の Story を参照）。 */
export const Error: Story = {
  args: { error: true },
};

/** 操作不可。 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "1" },
};

/**
 * `FormField` と組み合わせた実際の使い方。
 * ラベルがアクセシブルな名前になるため `aria-label` は不要。
 */
export const WithFormField: Story = {
  render: () => (
    <div className="space-y-4">
      <FormField label="店舗" required helpText="店名の一部で絞り込めます">
        <Combobox items={SHOPS} placeholder="店舗を検索" />
      </FormField>
      <FormField label="タグ" error="1 つ以上選んでください">
        <Combobox items={TAGS} multiple creatable placeholder="タグを検索・追加" error />
      </FormField>
    </div>
  ),
};

/** 新規作成された値の見え方。チップには接頭辞ではなく名前が出る。 */
export const WithCreatedValue: Story = {
  args: {
    items: TAGS,
    multiple: true,
    creatable: true,
    defaultValue: ["t1", `${COMBOBOX_CREATE_PREFIX}新しいタグ`],
    "aria-label": "タグ",
  },
};
