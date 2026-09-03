import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle } from "../../components/application/ThemeToggle";
import { Labeled, Section, Showcase } from "../_showcase";

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**ThemeToggle** は、ライトモード／ダークモードを切り替えるボタンコンポーネントです。

- **自動状態切り替え**: デフォルトで HTML の \`.dark\` クラスおよび \`localStorage\` の自動同期・永続化を行います。
- **制御モード**: \`theme\` プロパティや \`onToggle\` ハンドラーを指定して親コンポーネント側でテーマ状態を制御することも可能です。
        `,
      },
    },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 非制御（既定）と制御モードの見た目を並べる。
 *
 * アイコンは現在のテーマではなく「押すと切り替わる先」を表す。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="Modes"
        note="既定は非制御。html の .dark と localStorage を自分で同期する。テーマを親で持つ場合だけ theme を渡す。"
      >
        <div className="flex flex-wrap items-start gap-8">
          <Labeled label="非制御（既定）">
            <ThemeToggle />
          </Labeled>
          <Labeled label='theme="light"'>
            <ThemeToggle theme="light" />
          </Labeled>
          <Labeled label='theme="dark"'>
            <ThemeToggle theme="dark" />
          </Labeled>
        </div>
      </Section>

      <Section
        title="In Header"
        note="ヘッダー右端に置く。ラベルは持たないため aria-label（既定で設定済み）に頼る。"
      >
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <span className="text-sm font-medium text-foreground">申請管理</span>
          <div className="flex-1" />
          <ThemeToggle />
        </div>
      </Section>
    </Showcase>
  ),
};

export const Default: Story = {};

export const ControlledLight: Story = {
  args: {
    theme: "light",
  },
};

export const ControlledDark: Story = {
  args: {
    theme: "dark",
  },
};
