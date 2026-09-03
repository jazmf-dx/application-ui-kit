import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, ChevronDown, Copy, Download, MoreVertical, Pencil, Trash } from "lucide-react";
import * as React from "react";
import {
  Button,
  ConfirmDialog,
  Dropdown,
  type DropdownItem,
  toast,
} from "../../components/application";
import { Labeled, Section, Showcase } from "../_showcase";

/**
 * Dropdown は行アクションのメニュー。
 *
 * <important>
 * 項目は JSX ではなく `items` 配列で渡す。
 * キーボード操作（矢印・Enter・Esc）とフォーカス管理はコンポーネントが担保する。
 * </important>
 */
const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

「編集・複製・削除」のような**操作の集まり**を 1 つのボタンに畳む。
配列で渡す API にすることで、区切り線の位置・危険な操作の色・
キーボード操作を画面ごとに書き直さずに済む。

## 使う場面

- テーブルの行アクション（右端の ⋮ ボタン）
- カードの見出し右のメニュー
- 操作が 3 つ以上あり、ボタンを並べると横幅が足りない場面

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 選択肢から**値を選ぶ** | \`Select\`。ドロップダウンメニューは「操作」、セレクトは「入力」 |
| 操作が 1〜2 個 | ボタンを直接置く。1 個の操作をメニューに隠すと 2 クリックになる |
| 主要な操作（新規作成など） | 画面上部に \`Button variant="primary"\` で常時表示する |
| ページ間の移動 | ナビゲーション。メニューに \`<a>\` を詰めるとリンクだと分からない |
| テンプレート（.html） | テンプレート側の JS（\`x-show\` 等）によるメニュー partial。React コンポーネントを新設しない |
| 項目が 10 個以上 | 分類が必要。検索できる UI か、専用画面を検討する |

## Props

\`\`\`ts
type DropdownItem = {
  key: string                  // 一意なキー（必須）
  label: React.ReactNode       // 表示ラベル
  icon?: React.ReactNode       // 左のアイコン（w-4 h-4 で揃える）
  onSelect?: () => void        // 選択時の処理
  danger?: boolean             // 赤字にする（削除など）
  disabled?: boolean           // 無効化
  separatorBefore?: boolean    // この項目の直前に区切り線を入れる
}
\`\`\`

| Prop | 説明 |
|---|---|
| \`trigger\` | メニューを開く要素。**単一の React 要素**（通常は \`Button\`） |
| \`items\` | 項目の配列 |
| \`label\` | メニュー上部の見出し（対象名を出すと分かりやすい） |
| \`align\` | \`start\` / \`center\` / \`end\`（既定 \`end\`） |

## 注意事項

- **アイコンだけのトリガーには \`aria-label\` を付ける。**
  \`<Button variant="ghost" size="icon" aria-label="操作メニュー">\` のように書く。
  付け忘れると読み上げが「ボタン」だけになる
- **\`danger: true\` は最後に置き、\`separatorBefore: true\` で区切る。**
  「編集」の隣に「削除」があると誤操作につながる
- **\`danger\` の項目から直接実行しない。** \`onSelect\` で
  \`ConfirmDialog\` を開く（Story の \`WithConfirmation\` を参照）
- \`key\` は React の key として使われる。項目を動的に組む場合も一意にする
- \`icon\` のサイズは \`w-4 h-4\` に揃える。混在すると行の高さが揺れる
- **\`trigger\` は単一要素。** 内部で \`render\` prop に渡すため、
  複数要素や文字列を直接渡すと動かない
- 権限がない操作は \`disabled: true\` にするか、\`items\` から除外する。
  押せるのに失敗する状態を作らない
        `,
      },
    },
  },
  argTypes: {
    trigger: { table: { disable: true } },
    items: { table: { disable: true } },
    label: { control: "text" },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
  },
  args: {
    trigger: (
      <Button variant="ghost" size="icon" aria-label="操作メニュー">
        <MoreVertical />
      </Button>
    ),
    items: [
      { key: "edit", label: "編集" },
      { key: "duplicate", label: "複製" },
      { key: "delete", label: "削除", danger: true, separatorBefore: true },
    ],
  },
  decorators: [
    (Story) => (
      // メニューが下に開くので、下方向に余白を確保する
      <div className="flex min-h-64 justify-center pt-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * トリガーの形・項目の構成・寄せ方を 1 画面で比較する。
 *
 * メニューは「行や画面に対する操作の入れ物」。ナビゲーションには使わない。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="Triggers"
        note="アイコンだけのトリガーには aria-label が必須。文字のトリガーには ▾ を付けて開くことを示す。"
      >
        <div className="flex flex-wrap items-start gap-8">
          <Labeled label="アイコン（⋮）">
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" aria-label="操作メニュー">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              }
              items={[
                { key: "edit", label: "編集" },
                { key: "duplicate", label: "複製" },
                { key: "delete", label: "削除", danger: true, separatorBefore: true },
              ]}
            />
          </Labeled>
          <Labeled label="文字 + ▾">
            <Dropdown
              trigger={
                <Button variant="secondary" rightIcon={<ChevronDown className="w-4 h-4" />}>
                  操作
                </Button>
              }
              items={[
                { key: "edit", label: "編集" },
                { key: "export", label: "CSV でダウンロード" },
              ]}
            />
          </Labeled>
        </div>
      </Section>

      <Section
        title="Items"
        note="削除などの取り消せない操作は danger にし、separatorBefore で他の操作から離す。"
      >
        <div className="flex flex-wrap items-start gap-8">
          <Labeled label="アイコン付き">
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" aria-label="操作メニュー（アイコン付き）">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              }
              items={[
                { key: "edit", label: "編集", icon: <Pencil className="w-4 h-4" /> },
                { key: "duplicate", label: "複製", icon: <Copy className="w-4 h-4" /> },
                { key: "export", label: "CSV でダウンロード", icon: <Download className="w-4 h-4" /> },
                { key: "archive", label: "アーカイブ", icon: <Archive className="w-4 h-4" /> },
                {
                  key: "delete",
                  label: "削除",
                  icon: <Trash className="w-4 h-4" />,
                  danger: true,
                  separatorBefore: true,
                },
              ]}
            />
          </Labeled>
          <Labeled label="見出し付き / 無効な項目あり">
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" aria-label="操作メニュー（見出し付き）">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              }
              label="この申請に対する操作"
              items={[
                { key: "edit", label: "編集" },
                { key: "approve", label: "承認（権限なし）", disabled: true },
                { key: "delete", label: "削除", danger: true, separatorBefore: true },
              ]}
            />
          </Labeled>
        </div>
      </Section>

      <Section title="Align" note="行の右端に置くメニューは end。既定は start。">
        <div className="flex flex-wrap items-start gap-8">
          {(["start", "center", "end"] as const).map((align) => (
            <Labeled key={align} label={`align="${align}"`}>
              <Dropdown
                align={align}
                trigger={
                  <Button variant="ghost" size="icon" aria-label={`操作メニュー（${align}）`}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                }
                items={[
                  { key: "edit", label: "編集" },
                  { key: "duplicate", label: "複製" },
                ]}
              />
            </Labeled>
          ))}
        </div>
      </Section>
    </Showcase>
  ),
};

/** 基本形。⋮ ボタンから開く。矢印キー・Enter・Esc が使える。 */
export const Default: Story = {};

/**
 * アイコン付き。
 *
 * アイコンは意味の補助であって、**アイコンだけで意味を伝えない**。
 * サイズは `w-4 h-4` に統一する。
 */
export const WithIcons: Story = {
  args: {
    items: [
      { key: "edit", label: "編集", icon: <Pencil /> },
      { key: "duplicate", label: "複製", icon: <Copy /> },
      { key: "export", label: "CSV でダウンロード", icon: <Download /> },
      { key: "archive", label: "アーカイブ", icon: <Archive /> },
      {
        key: "delete",
        label: "削除",
        icon: <Trash />,
        danger: true,
        separatorBefore: true,
      },
    ],
  },
};

/**
 * 見出し付き（`label`）。
 *
 * 操作の対象名を出すと、どの行のメニューを開いているのかが分かる。
 */
export const WithLabel: Story = {
  args: {
    label: "SYS-2026-0001",
    items: [
      { key: "edit", label: "編集", icon: <Pencil /> },
      { key: "duplicate", label: "複製", icon: <Copy /> },
      {
        key: "delete",
        label: "削除",
        icon: <Trash />,
        danger: true,
        separatorBefore: true,
      },
    ],
  },
};

/**
 * 権限がない操作を無効化する例（`disabled`）。
 *
 * 押せるのに失敗する状態を作らない。
 * 「なぜ押せないか」を伝える必要がある場合は、`items` から消すのではなく
 * `disabled` にしてラベルに理由を含める。
 */
export const WithDisabledItem: Story = {
  args: {
    items: [
      { key: "edit", label: "編集", icon: <Pencil /> },
      { key: "duplicate", label: "複製", icon: <Copy /> },
      {
        key: "delete",
        label: "削除（承認済みのため不可）",
        icon: <Trash />,
        danger: true,
        disabled: true,
        separatorBefore: true,
      },
    ],
  },
};

/**
 * 文字ラベルのトリガー。
 *
 * `⋮` 以外をトリガーにする場合の例。
 * 開くことが分かるように `ChevronDown` を添える。
 */
export const TextTrigger: Story = {
  args: {
    trigger: (
      <Button variant="secondary" rightIcon={<ChevronDown />}>
        操作
      </Button>
    ),
    items: [
      { key: "export-csv", label: "CSV でダウンロード", icon: <Download /> },
      { key: "export-pdf", label: "PDF でダウンロード", icon: <Download /> },
      {
        key: "archive",
        label: "アーカイブ",
        icon: <Archive />,
        separatorBefore: true,
      },
    ],
  },
};

/** 開く方向の比較（`align`）。既定は `end`（トリガーの右端に揃える）。 */
export const Alignment: Story = {
  render: () => {
    const items: DropdownItem[] = [
      { key: "edit", label: "編集" },
      { key: "duplicate", label: "複製" },
    ];
    const ALIGNS = ["start", "center", "end"] as const;

    return (
      <div className="flex w-full max-w-2xl items-start justify-between">
        {ALIGNS.map((align) => (
          <div key={align} className="flex flex-col items-center gap-2">
            <code className="text-xs text-muted-foreground">align=&quot;{align}&quot;</code>
            <Dropdown
              align={align}
              trigger={
                <Button variant="secondary" size="sm">
                  開く
                </Button>
              }
              items={items}
            />
          </div>
        ))}
      </div>
    );
  },
};

/**
 * 削除は確認ダイアログを経由する。
 *
 * `danger` の項目から**直接実行しない**。
 * `onSelect` で `ConfirmDialog` を開き、そこで初めて実行する。
 * これが実アプリでの標準的な組み合わせ。
 */
export const WithConfirmation: Story = {
  render: () => {
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    return (
      <>
        <Dropdown
          label="SYS-2026-0001"
          trigger={
            <Button variant="ghost" size="icon" aria-label="操作メニュー">
              <MoreVertical />
            </Button>
          }
          items={[
            {
              key: "edit",
              label: "編集",
              icon: <Pencil />,
              onSelect: () => toast.info("編集画面を開きます"),
            },
            {
              key: "duplicate",
              label: "複製",
              icon: <Copy />,
              onSelect: () => toast.success("複製しました"),
            },
            {
              key: "delete",
              label: "削除",
              icon: <Trash />,
              danger: true,
              separatorBefore: true,
              // ✓ 直接消さず、確認ダイアログを開く
              onSelect: () => setConfirmOpen(true),
            },
          ]}
        />

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          type="danger"
          title="削除確認"
          message="申請「備品購入（モニター 2 台）」を削除しますか？"
          detail="削除すると元に戻せません。"
          confirmText="削除"
          onConfirm={async () => {
            await new Promise((resolve) => window.setTimeout(resolve, 800));
            toast.success("削除しました");
          }}
        />
      </>
    );
  },
};

/**
 * 一覧の行アクションとして使う例。
 *
 * 実際の配置はこの形になる。`Table` の `WithActions` も参照。
 */
export const InListRow: Story = {
  render: () => {
    const ROWS = [
      { code: "SYS-2026-0001", title: "備品購入（モニター 2 台）", locked: false },
      { code: "SYS-2026-0002", title: "出張費精算（大阪）", locked: false },
      { code: "SYS-2026-0003", title: "書籍購入", locked: true },
    ];

    return (
      <div className="w-full max-w-xl divide-y divide-border rounded-xl border border-border bg-card">
        {ROWS.map((row) => (
          <div key={row.code} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{row.title}</p>
              <p className="font-mono text-xs text-muted-foreground">{row.code}</p>
            </div>
            <Dropdown
              label={row.code}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${row.title} の操作メニュー`}
                >
                  <MoreVertical />
                </Button>
              }
              items={[
                { key: "edit", label: "編集", icon: <Pencil /> },
                { key: "duplicate", label: "複製", icon: <Copy /> },
                {
                  key: "delete",
                  label: row.locked ? "削除（承認済みのため不可）" : "削除",
                  icon: <Trash />,
                  danger: true,
                  disabled: row.locked,
                  separatorBefore: true,
                },
              ]}
            />
          </div>
        ))}
      </div>
    );
  },
};
