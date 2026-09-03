import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle } from "lucide-react";
import { Badge, Table } from "../../components/application";
import { Cluster, Section, Showcase } from "../_showcase";

/**
 * Badge はステータス・種別・優先度を表すピル型ラベル。
 *
 * <important>
 * バッジは色だけに意味を持たせない。現状セマンティックカラーは WCAG AA 未達
 * （ai-dev-standards/accessibility.md）のため、必ず文字（「完了」「未対応」等）で
 * 意味が読み取れるようにする。
 * </important>
 */
const meta = {
  title: "コンポーネント/Badge",
  component: Badge,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

ステータス・種別・優先度の表示を統一する。色の意味は
[colors.md のドメインステータスカラー](../?path=/docs/foundations-colors--docs)に揃えている。

## 使う場面

- 一覧・テーブルのステータス列
- カードの種別・優先度表示

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| テンプレート（.html） | \`badge {{ obj.status_display_class }}\`（\`models.py\` の \`*_display_class\` と組み合わせる） |
| クリックできる操作 | \`Button\`（バッジはクリック不可の表示専用） |
| 数値のカウント表示（未読件数等） | 別途 \`avatar-*\` 系のドット表示を検討 |

## tone の対応

| tone | 意味 | 色 |
|---|---|---|
| \`new\` | 新規・未対応・要注意 | Yellow |
| \`active\` | 進行中 | Sky |
| \`done\` | 完了・解決・承認 | Emerald |
| \`warning\` | 差戻し・警告 | Orange |
| \`danger\` | 緊急・エラー・却下 | Rose |
| \`pending\` | 検討中・保留 | Purple |
| \`neutral\`（既定） | 終了・無効・アーカイブ | Gray |

## 注意事項

- **同じ意味の状態には全アプリで同じ tone を使う**（アプリごとに系統を変えない）
- \`models.py\` の \`*_display_class\` プロパティと対応を揃えること
        `,
      },
    },
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["new", "active", "done", "warning", "danger", "pending", "neutral"],
    },
  },
  args: {
    children: "対応中",
    tone: "active",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * tone の一覧とアイコン付きの見た目を 1 画面で比較する。
 *
 * tone は「意味 → 色」の対応であり、見た目で選ぶものではない。
 * 同じ意味の状態には全アプリで同じ tone を使う。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="Tones"
        note="色だけに意味を持たせない。文字（「完了」「未対応」等）だけで意味が読み取れるようにする。"
      >
        <Cluster>
          <Badge tone="new">受付</Badge>
          <Badge tone="active">対応中</Badge>
          <Badge tone="done">完了</Badge>
          <Badge tone="warning">差戻し</Badge>
          <Badge tone="danger">却下</Badge>
          <Badge tone="pending">保留</Badge>
          <Badge tone="neutral">アーカイブ</Badge>
        </Cluster>
      </Section>

      <Section title="With Icon" note="アイコンは意味の補助。アイコンだけにして文字を省かない。">
        <Cluster>
          <Badge tone="danger" icon={<AlertCircle className="w-3 h-3" />}>
            期限超過
          </Badge>
          <Badge tone="warning" icon={<AlertCircle className="w-3 h-3" />}>
            要確認
          </Badge>
        </Cluster>
      </Section>

      <Section title="長いラベル" note="バッジは折り返さない。長い文字列は列幅を押し広げるため短く保つ。">
        <Cluster>
          <Badge tone="active">承認待ち（部長承認）</Badge>
          <Badge tone="neutral">2026 年度上期</Badge>
        </Cluster>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/** アイコン付き。 */
export const WithIcon: Story = {
  args: {
    tone: "danger",
    icon: <AlertCircle className="h-3 w-3" />,
    children: "エラー",
  },
};

type Row = { id: number; title: string; tone: "new" | "active" | "done"; label: string };

/** Table のステータス列で使う実際の使い方。 */
export const InTable: Story = {
  render: () => {
    const rows: Row[] = [
      { id: 1, title: "備品購入申請", tone: "new", label: "未対応" },
      { id: 2, title: "出張申請", tone: "active", label: "対応中" },
      { id: 3, title: "休暇申請", tone: "done", label: "完了" },
    ];
    return (
      <Table<Row>
        columns={[
          { key: "title", header: "件名", cell: (r) => r.title },
          {
            key: "status",
            header: "ステータス",
            cell: (r) => <Badge tone={r.tone}>{r.label}</Badge>,
          },
        ]}
        rows={rows}
        rowKey={(r) => r.id}
      />
    );
  },
};
