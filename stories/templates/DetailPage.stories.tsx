import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText, Inbox, LayoutDashboard, Pencil } from "lucide-react";
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DescriptionList,
  Dropdown,
  PageHeader,
  Stat,
  Steps,
  Tabs,
} from "../../components/application";
import { StandardShell } from "./_shell";

/**
 * 詳細画面。PageHeader（パンくず・状態・主操作・タブ）+ 要約 Stat + DescriptionList + 補助情報の開閉。
 */
const meta = {
  title: "テンプレート/詳細画面",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component: `
## 目的

1 件の詳細を見せる画面の構成を固定する。

\`\`\`
1. PageHeader     パンくず → 見出し + 状態 Badge → 説明 → 主操作（右）→ タブ
2. Alert          対処が要ることがあれば先頭に（無ければ出さない）
3. 要約           Steps（進み具合）や Stat（件数・率）を上部に
4. 本文           DescriptionList（項目名と値）を Card で区切る
5. 補助情報       普段は閉じておくものは Accordion
\`\`\`

| 決めごと | ルール |
|---|---|
| 見出し | 対象の名前そのもの（「詳細」ではなく「モニターの増設」） |
| 状態 | 見出しの横に Badge 1 つ。複数の状態を並べない |
| 主操作 | 右上に 1 つ（編集）。その他は Dropdown に畳む |
| 項目と値 | DescriptionList。空は「—」で行を残す |
| 区画の切替 | タブ（概要 / 履歴 / 添付）。URL に載せる（\`?tab=\`） |

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 編集そのもの | 「パターン/フォーム」 |
| 一覧の中で少しだけ詳細を見る | 行の展開か Popover |
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const NAV = [
  { label: "ダッシュボード", href: "#dashboard", icon: <LayoutDashboard className="mr-2 size-4" /> },
  { label: "申請一覧", href: "#requests", icon: <Inbox className="mr-2 size-4" />, active: true },
  { label: "レポート", href: "#reports", icon: <FileText className="mr-2 size-4" /> },
];

/** 申請の詳細。 */
export const RequestDetail: Story = {
  render: () => {
    const [tab, setTab] = React.useState("overview");
    return (
      <StandardShell appName="DX ポータル" nav={NAV}>
        <PageHeader
          breadcrumbs={[
            { label: "ホーム", href: "#" },
            { label: "申請一覧", href: "#requests" },
            { label: "モニターの増設" },
          ]}
          title="モニターの増設"
          badge={<Badge tone="active">対応中</Badge>}
          description="申請番号 SYS-2026-0001 · 山田 太郎 · 2026-08-30 申請"
          actions={
            <>
              <Dropdown
                trigger={
                  <Button variant="secondary" aria-label="その他の操作">
                    その他
                  </Button>
                }
                items={[
                  { key: "copy", label: "複製する" },
                  { key: "assign", label: "担当者を変更" },
                  { key: "close", label: "取り下げる", danger: true, separatorBefore: true },
                ]}
              />
              <Button variant="primary" leftIcon={<Pencil />}>
                編集
              </Button>
            </>
          }
          tabs={
            <Tabs
              value={tab}
              onValueChange={setTab}
              items={[
                { value: "overview", label: "概要", content: null },
                { value: "history", label: "履歴", content: null },
                { value: "files", label: "添付（2）", content: null },
              ]}
            />
          }
        />

        <Alert tone="warning" title="見積書が添付されていません" className="mb-6" actions={<Button variant="secondary" size="sm">添付する</Button>}>
          金額が 5 万円を超える申請は、見積書が無いと承認に進めません。
        </Alert>

        <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>進み具合</CardTitle>
              </CardHeader>
              <CardContent>
                <Steps
                  current={1}
                  items={[
                    { label: "受付", description: "2026-08-30" },
                    { label: "審査", description: "情報システム部" },
                    { label: "承認", description: "部長" },
                    { label: "発注" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>申請内容</CardTitle>
              </CardHeader>
              <CardContent>
                <DescriptionList
                  columns={2}
                  items={[
                    { term: "品名", description: "27 インチモニター" },
                    { term: "数量", description: "2 台" },
                    { term: "用途", description: "増設" },
                    { term: "希望納期", description: "2026-09-15" },
                    { term: "金額", description: "78,000 円" },
                    { term: "承認日", description: null },
                    {
                      term: "理由",
                      description: "在宅勤務との併用で 2 画面が必要。既存のアームは流用する。",
                      span: 2,
                    },
                  ]}
                />
              </CardContent>
            </Card>
            <Accordion>
              <AccordionItem value="history">
                <AccordionTrigger>変更履歴（3）</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1 text-sm">
                    <li>2026-09-01 10:12 山田 太郎 — 数量を 1 → 2 に変更</li>
                    <li>2026-08-31 09:03 鈴木 花子 — 担当者を割り当て</li>
                    <li>2026-08-30 17:40 山田 太郎 — 申請</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="space-y-4">
            <Stat label="同じ部署の申請" value="7" unit="件" hint="今年度" />
            <Stat label="平均処理日数" value="3.2" unit="日" delta="-0.4 前月比" tone="positive" />
          </div>
        </div>
      </StandardShell>
    );
  },
};
