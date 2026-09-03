import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Download, Plus, Trash } from "lucide-react";
import { Button } from "../../components/application";
import { Cluster, Section, Showcase } from "../_showcase";

/**
 * Button は画面上のあらゆるアクションに使う唯一のボタンコンポーネント。
 *
 * <important>
 * これは **React コンポーネントの中でだけ** 使う。
 * テンプレート（.html）では `<button class="btn-primary">` を使う。
 * 見本は Foundations を参照。
 * </important>
 */
const meta = {
  title: "コンポーネント/Button",
  component: Button,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

アクションの「意味」を色で伝えるボタン。variant を 6 種に固定することで、
プロジェクト・画面をまたいで同じ操作が同じ見た目になるようにしている。

## 使う場面

- React コンポーネント内のあらゆるクリック操作
- フォーム送信・ダイアログの確定 / キャンセル

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| テンプレート（.html）内のボタン | \`<button class="btn-primary">\` |
| 画面遷移するだけのリンク | \`<a>\` + \`variant="link"\`。見た目がボタンでも意味がリンクなら \`<a>\` を使う |
| アイコンだけの小さな操作（テーブル行内など） | \`variant="ghost"\` + \`size="sm"\` |
| shadcn/ui の \`Button\` を直接使う | 禁止。必ず Button を経由する（the UI Kit rule） |

## 注意事項

- **1 画面に \`primary\` は原則 1 つ。** 主アクションが複数あると利用者が迷う
- **削除は必ず \`danger\`**、**キャンセルは必ず \`secondary\`**。色と意味の対応を崩さない
- \`loading\` 中は自動で \`disabled\` になる（二重送信防止）。\`disabled\` を別途渡す必要はない
- 色を変えたいときは \`className\` で上書きせず、\`tokens/theme.css\` のトークンを変更する
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "success", "ghost", "link"],
      description: "アクションの意味に対応する色",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg", "icon"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
    leftIcon: { table: { disable: true } },
    rightIcon: { table: { disable: true } },
  },
  args: {
    children: "保存",
    variant: "primary",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * variant / size / 状態を 1 画面で比較する。
 *
 * 「どの variant を使うべきか」を決めるのはここ。
 * 個別の操作確認・Props 変更は下の各 Story で行う。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="Variants"
        note="色は意味に対応する。削除は必ず danger、キャンセルは必ず secondary。primary は 1 画面に原則 1 つ。"
      >
        <Cluster>
          <Button variant="primary">保存</Button>
          <Button variant="secondary">キャンセル</Button>
          <Button variant="danger">削除</Button>
          <Button variant="success">承認</Button>
          <Button variant="ghost">詳細</Button>
          <Button variant="link">利用規約を読む</Button>
        </Cluster>
      </Section>

      <Section title="Sizes" note="テーブル行内は sm、ページの主要 CTA は lg。既定は default。">
        <Cluster>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="追加">
            <Plus className="w-4 h-4" />
          </Button>
        </Cluster>
      </Section>

      <Section
        title="States"
        note="loading は自動で disabled になるため、二重送信の防止に disabled を併記する必要はない。"
      >
        <Cluster>
          <Button>保存</Button>
          <Button disabled>保存</Button>
          <Button loading>送信中...</Button>
          <Button variant="danger" loading>
            削除中...
          </Button>
        </Cluster>
      </Section>

      <Section title="With Icon" note="アイコンはラベルの代わりにしない。icon サイズには aria-label を付ける。">
        <Cluster>
          <Button leftIcon={<Plus className="w-4 h-4" />}>タスク追加</Button>
          <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            次へ
          </Button>
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
            CSV 出力
          </Button>
          <Button variant="danger" leftIcon={<Trash className="w-4 h-4" />}>
            削除する
          </Button>
        </Cluster>
      </Section>
    </Showcase>
  ),
};

/** メインアクション。作成・送信・保存に使う。1 画面に原則 1 つ。 */
export const Primary: Story = {
  args: { variant: "primary", children: "保存" },
};

/** 補助操作。キャンセル・戻るは必ずこれ。 */
export const Secondary: Story = {
  args: { variant: "secondary", children: "キャンセル" },
};

/** 削除・取り消し不可の操作。削除は必ずこれ。 */
export const Destructive: Story = {
  args: { variant: "danger", children: "削除" },
};

/** 承認・確定・保存完了。 */
export const Success: Story = {
  args: { variant: "success", children: "承認" },
};

/** 背景なし。テーブル行内などの控えめな操作に。 */
export const Ghost: Story = {
  args: { variant: "ghost", children: "詳細" },
};

/** テキストリンク風。画面遷移を伴う場合は `<a>` に付ける。 */
export const Link: Story = {
  args: { variant: "link", children: "利用規約を読む" },
};

/** 操作不可。理由が利用者に伝わるよう `title` かヘルプテキストを併記する。 */
export const Disabled: Story = {
  args: { disabled: true, children: "保存" },
};

/**
 * 送信中。`loading` は自動で `disabled` になるため二重送信を防げる。
 * ラベルは「送信中...」のように進行形にする。
 */
export const Loading: Story = {
  args: { loading: true, children: "送信中..." },
};

/** アイコン付き。アイコンとラベルの間隔はコンポーネント側で `gap` が入る。 */
export const WithIcon: Story = {
  args: { leftIcon: <Plus />, children: "タスク追加" },
};

/**
 * 実際の配置例。
 * 主アクションを右に置き、キャンセルはその左に secondary で置く。
 */
export const InDialogFooter: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-md rounded-xl border border-border p-4">
      <p className="mb-4 text-sm text-muted-foreground">
        この操作は取り消せません。よろしいですか？
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary">キャンセル</Button>
        <Button variant="danger" leftIcon={<Trash />}>
          削除する
        </Button>
      </div>
    </div>
  ),
};

/** ツールバー内の配置例。`size="sm"` で高さを揃える。 */
export const InToolbar: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-2 rounded-lg border border-border p-2">
      <Button size="sm" leftIcon={<Plus />}>
        新規
      </Button>
      <Button size="sm" variant="secondary" leftIcon={<Download />}>
        CSV 出力
      </Button>
      <div className="flex-1" />
      <Button size="sm" variant="ghost">
        絞り込み
      </Button>
    </div>
  ),
};
