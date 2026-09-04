import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
} from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * Accordion は shadcn/ui（Base UI）の re-export。見出し付きの開閉。
 * テンプレート側の `<details class="disclosure">` と同じ見た目。
 */
const meta = {
  title: "コンポーネント/Accordion",
  component: Accordion,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

同種の区画が連続するときに折りたたんで一覧性を上げる。API は
[shadcn/ui の Accordion](https://ui.shadcn.com/docs/components/accordion) と同じ。

## 使う場面

- FAQ、設定のグループ、詳細画面の補助情報
- 「完了したもの」など、普段は閉じておきたい一覧

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 同じ階層のビューを切り替える | \`Tabs\` |
| テンプレート（.html）の開閉 | \`<details class="disclosure">\`（JS 不要）。件数の動的更新が要るなら Islands の \`disclosure\` |
| 見出しを持たない開閉制御 | \`Collapsible\` |

## 注意事項

- 中身が 1 つしか無いなら折りたたまない。見せたいものは最初から見せる
- 見出しは内容が分かる言葉にする（「その他」で隠さない）
        `,
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  { value: "shipping", title: "配送について", body: "通常 2〜3 営業日でお届けします。" },
  { value: "returns", title: "返品・交換", body: "到着後 14 日以内であれば承ります。" },
  { value: "support", title: "問い合わせ先", body: "平日 9:00〜17:00 に情シスデスクへ。" },
];

/** 単一開閉 / 複数開閉 / 件数付きを比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="単一開閉（既定）" note="1 つ開くと他は閉じる。FAQ 向き。">
        <Accordion defaultValue={["shipping"]}>
          {ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
      <Section title="複数開閉" note="独立して開閉できる。設定グループ向き。">
        <Accordion multiple defaultValue={["shipping", "returns"]}>
          {ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
      <Section title="件数付き" note="見出しの右に Badge。テンプレートの disclosure と同じ形。">
        <Accordion>
          <AccordionItem value="done">
            <AccordionTrigger>
              <span className="inline-flex items-center gap-2">
                完了したコース <Badge tone="neutral">12</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>完了したコースの一覧がここに入る。</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {
  render: () => (
    <Accordion>
      {ITEMS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};
