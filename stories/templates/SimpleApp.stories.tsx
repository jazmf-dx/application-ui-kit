import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DatePicker,
  FormField,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "../../components/application";
import { SimpleShell } from "./_shell";

/**
 * Simple App — 単機能ツール、小規模ユーティリティ、簡易申請。
 *
 * Sidebar を持たない。Header（左: アプリ名 / 右: User Menu）+ Main を中心に構成。
 */
const meta = {
  title: "テンプレート/シンプルアプリ（Simple App）",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component: `
## 目的

Application UI Standard §7 の **Simple App** の実物。単機能ツール・小規模ユーティリティ・簡易申請の起点。

\`\`\`
+--------------------------------------------------------------+
| Header: [アプリ名]                                [User Menu] |
+--------------------------------------------------------------+
|              PageHeader（必要なら）                            |
|              Main Content（中心に構成。max-w-2xl 程度）        |
+--------------------------------------------------------------+
\`\`\`

## 注意事項

- Sidebar を持たない。画面が増えて主要ナビゲーションが要るなら Standard App へ
- フォームは「パターン/フォーム」の決めごと（縦の間隔・必須表示・ボタンの位置）に従う
- 1 カラムは \`max-w-2xl\` 程度。画面幅いっぱいに伸ばさない
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 簡易申請フォーム。 */
export const FormScreen: Story = {
  render: () => (
    <SimpleShell appName="備品申請">
      <PageHeader title="備品の申請" description="必要な備品と理由を入力してください。承認後に発注します" />
      <Alert tone="info" title="申請から発注までの目安は 3 営業日です" className="mb-6" />
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle>申請内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="品名" required>
              <Input placeholder="例: 27 インチモニター" />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="数量" required>
                <Input type="number" min={1} defaultValue={1} />
              </FormField>
              <FormField label="希望納期">
                <DatePicker mode="single" placeholder="日付を選択" />
              </FormField>
            </div>
            <FormField label="用途" required>
              <Select
                items={[
                  { value: "new", label: "新規配備" },
                  { value: "replace", label: "故障の交換" },
                  { value: "add", label: "増設" },
                ]}
                placeholder="選択してください"
              />
            </FormField>
            <FormField label="理由" required helpText="200 文字まで">
              <Textarea maxLength={200} showCount rows={3} />
            </FormField>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" type="button">
            キャンセル
          </Button>
          <Button variant="primary" type="submit">
            申請する
          </Button>
        </div>
      </form>
    </SimpleShell>
  ),
};
