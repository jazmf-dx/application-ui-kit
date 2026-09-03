import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Plus } from "lucide-react";
import { Badge, Button, PageHeader, Tabs } from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * PageHeader は画面の見出し領域。見出し・説明・パンくず・主操作・タブの位置を固定する。
 */
const meta = {
  title: "コンポーネント/PageHeader",
  component: PageHeader,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

Application UI Standard §7 の「Main Content 上部に Page Header、Primary Action は Page Header 領域（右側）」を
部品として固定する。テンプレート側の \`.page-header\` と同じ見た目。

## 使う場面

- すべての画面の最上部（一覧・詳細・編集・設定・ダッシュボード）
- 区画の見出し（\`headingLevel={2}\`）にも使えるが、主操作を持つときだけ

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| ダイアログの見出し | \`Dialog\` の \`title\` |
| カードの見出し | \`CardHeader\` / \`CardTitle\` |
| 主操作も説明も無い区画見出し | 素の \`<h2>\` |

## 注意事項

- **主操作は \`actions\` に置く。** 本文側やフッターに散らさない。primary は 1 つ
- 見出しは既定で h1。1 画面に 1 つ。区画に使うときは \`headingLevel\` を上げる
- \`description\` は 1〜2 行。長い説明は本文側に置く
- \`tabs\` に \`Tabs\` を渡すと、見出し領域の下端にタブが付く（一覧 / 詳細の切替）
        `,
      },
    },
  },
  args: {
    title: "アイデア一覧",
    description: "社内から寄せられた意見・提案を確認します",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 一覧・詳細・区画見出しの 3 形を比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="一覧画面" note="パンくず無し。主操作は右。副操作は secondary。">
        <PageHeader
          title="アイデア一覧"
          description="社内から寄せられた意見・提案を確認します"
          actions={
            <>
              <Button variant="secondary" leftIcon={<Download />}>
                CSV 出力
              </Button>
              <Button variant="primary" leftIcon={<Plus />}>
                新規作成
              </Button>
            </>
          }
        />
      </Section>

      <Section title="詳細画面" note="パンくず + 見出しの横に状態。タブで区画を切り替える。">
        <PageHeader
          breadcrumbs={[
            { label: "ホーム", href: "/" },
            { label: "アイデア", href: "/ideas/" },
            { label: "モニターの増設" },
          ]}
          title="モニターの増設"
          badge={<Badge tone="active">対応中</Badge>}
          description="申請番号 SYS-2026-0001 · 山田 太郎 · 2026-08-30"
          actions={<Button variant="primary">編集</Button>}
          tabs={
            <Tabs
              items={[
                { value: "overview", label: "概要", content: null },
                { value: "history", label: "履歴", content: null },
              ]}
              defaultValue="overview"
            />
          }
        />
      </Section>

      <Section title="区画の見出し（h2）" note="主操作を持つ区画にだけ使う。">
        <PageHeader
          headingLevel={2}
          title="通知設定"
          badge={<Badge tone="warning">未設定</Badge>}
          actions={
            <Button variant="secondary" size="sm">
              設定する
            </Button>
          }
        />
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/** 主操作付き。 */
export const WithActions: Story = {
  args: {
    actions: (
      <Button variant="primary" leftIcon={<Plus />}>
        新規作成
      </Button>
    ),
  },
};

/** パンくず + 状態 + タブ。 */
export const Detail: Story = {
  args: {
    breadcrumbs: [
      { label: "ホーム", href: "/" },
      { label: "アイデア", href: "/ideas/" },
      { label: "モニターの増設" },
    ],
    title: "モニターの増設",
    badge: <Badge tone="active">対応中</Badge>,
    description: "申請番号 SYS-2026-0001",
    actions: <Button variant="primary">編集</Button>,
  },
};
