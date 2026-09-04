import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FileDropZone, FormField } from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * FileDropZone はファイルの選択・ドロップ・事前チェック・選択済み一覧。アップロードは行わない。
 */
const meta = {
  title: "コンポーネント/FileDropZone",
  component: FileDropZone,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

ファイル添付の入口を統一する。種類・サイズ・件数の不備は選んだ瞬間に伝え、
サーバーで弾かれるまで待たせない。

## 使う場面

- 添付ファイル・画像・CSV の取り込み欄
- Django Form の \`<input type="file">\` に枠を付ける（Islands の \`file-drop-zone\`）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 進捗表示つきの逐次アップロード | この部品 + \`Progress\`。アップロード処理は呼び出し側 |
| 画像の切り抜き・プレビュー編集 | 利用側で選定（Recommendations / Frontend） |

## 注意事項

- 親が \`files\` を持つ制御コンポーネント。削除も \`onFilesChange\` に残りを渡すだけ
- \`maxSize\` はバイト。上限は \`description\` にも人が読める形で書く（「10MB まで」）
- Django の input と組み合わせるときは \`onBrowse\` を渡し、内部 input を描かない（name の重複を避ける）
- サーバー側の検証は残す。ここでのチェックは UX 改善で、正当性の最終判断ではない
        `,
      },
    },
  },
  // 各 Story は render で制御コンポーネントとして描く。args は型のために最小限だけ持つ。
  args: { onFilesChange: () => {} },
} satisfies Meta<typeof FileDropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(props: Partial<React.ComponentProps<typeof FileDropZone>>) {
  const [files, setFiles] = React.useState<File[]>([]);
  return <FileDropZone files={files} onFilesChange={setFiles} {...props} />;
}

/** 単一 / 複数 / 制限あり / 無効 を比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="単一ファイル" note="2 件目を選ぶと置き換わる。">
        <Controlled accept=".pdf" description="PDF のみ" />
      </Section>
      <Section title="複数・上限あり" note="種類違い・サイズ超過は選んだ瞬間に理由を出し、合格分だけを渡す。">
        <Controlled
          multiple
          accept=".pdf,image/*"
          maxSize={2 * 1024 * 1024}
          maxFiles={3}
          description="PDF または画像。1 ファイル 2MB、3 件まで"
        />
      </Section>
      <Section title="FormField と組み合わせる" note="ラベル・必須・エラーは FormField が持つ。">
        <FormField label="添付ファイル" required helpText="見積書があれば添付してください">
          <Controlled accept=".pdf" />
        </FormField>
      </Section>
      <Section title="無効" note="読み取り専用の画面など。">
        <FileDropZone files={[]} onFilesChange={() => {}} disabled description="編集できません" />
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {
  render: () => <Controlled />,
};

/** 制限あり。 */
export const WithLimits: Story = {
  render: () => (
    <Controlled
      multiple
      accept=".csv"
      maxSize={1024 * 1024}
      maxFiles={2}
      description="CSV のみ。1MB、2 件まで"
    />
  ),
};
