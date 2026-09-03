import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  CopyButton,
  type CopyResult,
  Input,
} from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

/**
 * CopyButton は「画面に出した値を持ち帰らせる」ためのコピーボタン。
 */
const meta = {
  title: "コンポーネント/CopyButton",
  component: CopyButton,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

クリップボードへのコピーを毎回書かずに済むようにする。\`navigator.clipboard\` は
**secure context 限定**（HTTPS / localhost）で、社内配備の \`http://<IP>:<port>\` では
undefined になり「ボタンが黙って何もしない」事故になる。このボタンは
clipboard → \`execCommand('copy')\` → 選択して手動コピー、の三段構えを内包する。

## 使う場面

- ワンタイム URL・API トークン・ID・コマンドなど、値を他所へ持っていく操作

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| Django テンプレートに置くコピー欄 | Islands の \`copy-field\`（入力欄 + ボタン + 案内行の一式） |

## 注意事項

- **一度しか表示されない値（ワンタイム URL 等）は、値が見える入力欄と組にする**。
  \`fallbackSelectRef\` に入力欄を渡すと、全滅時も値を選択したままにでき、
  \`onCopyResult\` の \`"selected"\` で「Ctrl+C でコピーしてください」と案内できる
- 成功・失敗のラベル差し替えは \`aria-live\` で支援技術にも伝わる
        `,
      },
    },
  },
  args: {
    value: "https://example.com/one-time/abcdef",
  },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 状態とバリアントを 1 画面で比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="States" note="押すと 2 秒間「コピーしました」に変わり、元へ戻る。">
        <Stack>
          <Labeled label="基本（secondary）">
            <CopyButton value="コピーされる値" />
          </Labeled>
          <Labeled label="ラベル変更">
            <CopyButton value="git clone ..." label="コマンドをコピー" />
          </Labeled>
          <Labeled label="primary">
            <CopyButton value="コピーされる値" variant="primary" />
          </Labeled>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/**
 * 一度しか表示されない値（ワンタイム URL 等）の組み立て方。
 *
 * 値が見える readonly 入力欄と組にし、`fallbackSelectRef` で全滅時の退避先を渡す。
 * Django テンプレートならこの一式が Islands の `copy-field` として使える。
 */
export const WithVisibleValue: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [status, setStatus] = React.useState("");
    const value = "https://example.com/one-time/abcdef";

    const handleResult = (result: CopyResult) => {
      setStatus(
        result === "copied" ? "" : "値を選択しました。Ctrl+C（Mac は ⌘+C）でコピーしてください。",
      );
    };

    return (
      <div className="max-w-xl">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            readOnly
            value={value}
            aria-label="発行した URL"
            className="font-mono"
          />
          <CopyButton
            className="shrink-0"
            value={value}
            fallbackSelectRef={inputRef}
            onCopyResult={handleResult}
          />
        </div>
        <p role="status" aria-live="polite" className="mt-2 text-xs text-muted-foreground">
          {status}
        </p>
      </div>
    );
  },
};
