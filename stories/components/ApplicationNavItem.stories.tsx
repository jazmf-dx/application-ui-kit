import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Clock, FileText, Inbox, Send, Settings } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { ApplicationNavItem } from "../../components/application/ApplicationNavItem";

/** セクションのアクセント色を差し込むためのヘルパー（利用側アプリでは CSS クラスで行う） */
const accent = (color: string) => ({ "--color-nav-accent": color }) as React.CSSProperties;

const meta = {
  title: "Components/ApplicationNavItem",
  component: ApplicationNavItem,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
ナビゲーション項目。リンクとボタンのどちらにもなり、選択中を色とハイライトで示す。

- **セマンティック切り替え**: \`href\` 指定時は \`<a>\`（\`aria-current="page"\`）、未指定時は \`<button>\`（\`aria-pressed\`）
- **ハイライト**: \`indicator\`（既定 \`true\`）で、項目間を移動するアニメーション付きハイライト。\`false\` で静的な背景色
- **色を持たない**: アクセント色は \`--color-nav-accent\` トークンだけを見る

### セクションごとに色を変える

このコンポーネントは色を列挙しない。セクションの集合はアプリ固有なので、**利用側アプリ**で
\`--color-nav-accent\` を上書きする。CSS カスタムプロパティは継承するため、
セクションのラッパーに一度当てれば中の項目すべてに効く。

\`\`\`css
/* アプリ側の CSS */
.nav-section-requests { --color-nav-accent: var(--color-section-requests); }
.nav-section-masters  { --color-nav-accent: var(--color-section-masters); }
\`\`\`

\`\`\`tsx
<nav className="nav-section-requests">
  <ApplicationNavItem href="/requests" active>申請</ApplicationNavItem>
</nav>
\`\`\`

### 何に使わないか

| 場面 | 代わりに |
|---|---|
| テンプレートのナビ | \`sidebar.html\` / \`global_nav.html\` |
| 単発のボタン | \`ApplicationButton\` |
        `,
      },
    },
  },
  args: {
    label: "受信トレイ",
    icon: <Inbox className="w-4 h-4" />,
    active: true,
    href: "#",
  },
} satisfies Meta<typeof ApplicationNavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inactive: Story = {
  args: { active: false },
};

export const WithBadge: Story = {
  args: { badge: 12 },
};

/** 既定の `indicator`。選択が移動するとハイライトが滑らかに追従する。 */
export const AnimatedNavigationGroup: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("inbox");

    const items = [
      { id: "inbox", label: "受信トレイ", icon: <Inbox className="w-4 h-4" />, badge: 5 },
      { id: "someday", label: "いつか読む", icon: <Clock className="w-4 h-4" />, badge: 2 },
      { id: "archive", label: "アーカイブ", icon: <Archive className="w-4 h-4" /> },
    ];

    return (
      <div className="w-64 space-y-1 rounded-xl border border-border bg-muted p-4">
        {items.map((item) => (
          <ApplicationNavItem
            key={item.id}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            layoutId="storybook-nav-demo"
          />
        ))}
      </div>
    );
  },
};

/** `indicator={false}`。サイドバーのように縦に長く並ぶ場合の静的なハイライト。 */
export const SidebarStyle: Story = {
  render: () => {
    const items = [
      { value: "inbox", label: "受信トレイ", icon: <Inbox className="w-4 h-4" />, badge: 5 },
      { value: "sent", label: "送信済み", icon: <Send className="w-4 h-4" /> },
      { value: "drafts", label: "下書き", icon: <FileText className="w-4 h-4" />, badge: 2 },
      { value: "settings", label: "設定", icon: <Settings className="w-4 h-4" /> },
    ];

    return (
      <div className="w-56 space-y-1">
        {items.map((item) => (
          <ApplicationNavItem
            key={item.value}
            href="#"
            active={item.value === "inbox"}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            indicator={false}
          />
        ))}
      </div>
    );
  },
};

/**
 * セクションごとに `--color-nav-accent` を上書きした例。
 *
 * ここでは既存のセマンティックトークンを流用しているが、実際のアプリでは
 * 自前のセクション用トークンを定義してクラスで当てる。
 */
export const SectionAccents: Story = {
  render: () => {
    const sections = [
      { name: "申請", color: "var(--color-primary)", items: ["新規申請", "承認待ち"] },
      { name: "マスタ", color: "var(--color-success)", items: ["社員", "部署"] },
      { name: "レポート", color: "var(--color-warning)", items: ["月次", "年次"] },
    ];

    return (
      <div className="flex flex-wrap gap-6">
        {sections.map((section) => (
          <nav key={section.name} className="w-48 space-y-1" style={accent(section.color)}>
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.name}
            </p>
            {section.items.map((item, i) => (
              <ApplicationNavItem
                key={item}
                href="#"
                active={i === 0}
                label={item}
                indicator={false}
              />
            ))}
          </nav>
        ))}
      </div>
    );
  },
};
