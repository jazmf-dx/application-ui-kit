import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Button,
  Checkbox,
  FormDialog,
  FormField,
  Input,
  Select,
} from "../../components/application";
import { Cluster, Section, Showcase } from "../_showcase";

/**
 * FormDialog はフォーム入力を伴うダイアログ。
 *
 * <important>
 * 内部で `children` を `<form><fieldset>` で包んでいる。
 * そのため入力欄に `name` を付けるだけで `FormData` が取れ、
 * 送信中は fieldset ごと自動で無効化される。
 * </important>
 */
const meta = {
  title: "コンポーネント/FormDialog",
  component: FormDialog,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

ダイアログ内フォームで毎回書く必要があった以下を、コンポーネント側に閉じ込める。

- \`children\` を \`<form>\` で包み、確定ボタンから \`requestSubmit()\` を呼ぶ
  → **フッターのボタンが form の外にあっても submit が発火する**
- \`<fieldset disabled>\` で包む
  → **送信中は全入力が自動で無効化**され、二重送信も編集も防げる
- \`Enter\` キーでの送信（ネイティブ form の挙動）
- 送信中は \`Esc\`・背景クリック・× を無効化

## 使う場面

- 一覧画面から離れずに 1 件作成・編集する
- 入力項目が 5 個程度までのフォーム

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 確認だけ（入力なし） | \`ConfirmDialog\` |
| 入力項目が多い / 段階的な入力が必要 | **専用ページへ遷移する。** モーダル内スクロールのフォームは入力ミスに気付けない |
| ファイルアップロードが主目的 | ドロップ領域を含む専用画面。モーダルは領域が狭い |
| テンプレート（.html） |サーバーレンダリングでフォーム partial を差し込む。React コンポーネントを新設しない |
| 入力途中で他の情報を参照したくなるフォーム | ページにする。モーダルは背後を隠してしまう |

## Props

| Prop | 説明 |
|---|---|
| \`open\` / \`onOpenChange\` | 開閉状態（必ず制御する） |
| \`title\` / \`description\` | 見出しと説明 |
| \`children\` | フォームの中身。**\`<form>\` で包まない**（内部で包まれる） |
| \`onSubmit\` | \`(event) => void \\| Promise<void>\`。**\`preventDefault()\` は内部で済んでいる** |
| \`submitText\` | 送信ボタン（既定 \`保存\`） |
| \`cancelText\` | キャンセルボタン（既定 \`キャンセル\`） |
| \`submitVariant\` | \`primary\`（既定） / \`success\` |
| \`loading\` | 送信中。ボタンにスピナー + 入力無効化 + 閉じる操作の無効化 |
| \`disabled\` | 入力を無効化する（権限がない場合など） |
| \`maxWidth\` | \`sm\` / \`md\` / \`lg\`（既定） / \`xl\` / \`2xl\` |

## サーバーとの連携

React コンポーネントからの送信は fetch で行い、**CSRF トークンを必ず付ける**。

\`\`\`tsx
const csrf = document.querySelector<HTMLInputElement>('[name=csrfmiddlewaretoken]')?.value ?? ''

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  setLoading(true)
  try {
    const res = await fetch('/requests/create/', {
      method: 'POST',
      headers: { 'X-CSRFToken': csrf },
      body: new FormData(e.currentTarget),   // name 属性がそのままサーバー側のフィールド名になる
    })
    if (!res.ok) throw new Error('保存に失敗しました')
    setOpen(false)
    toast.success('作成しました')
  } catch (err) {
    setError(getMessage(err))
  } finally {
    setLoading(false)
  }
}
\`\`\`

application のバリデーションエラーは JSON で返し、\`FormField\` の \`error\` に流す
（Story の \`WithValidationError\` を参照）。

## 注意事項

- **\`children\` を \`<form>\` で包まない。** 内部で包んでいるため、
  入れ子の form になり submit が発火しなくなる
- **\`onSubmit\` で \`preventDefault()\` を呼ぶ必要はない**（内部で実行済み）。
  ただし \`e.currentTarget\` を \`await\` の後で参照すると null になるため、
  \`FormData\` は最初に取り出しておく
- **\`loading\` は呼び出し側で管理する。**
  \`ConfirmDialog\` と違い、こちらは自動化していない
  （バリデーションエラーで開いたままにする等、制御が必要な場面が多いため）
- **エラー表示は自前で行う。** 全体エラーは \`children\` の先頭に置き、
  項目単位のエラーは \`FormField\` の \`error\` に渡す
- 送信中に閉じられないため、通信が長引く可能性がある処理では
  タイムアウトを設けて \`loading\` を必ず解除する
- 縦の間隔は各項目に \`mb-*\` を付けず、\`children\` の親に \`space-y-4\` を付ける
        `,
      },
    },
  },
  argTypes: {
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    onSubmit: { table: { disable: true } },
    onCancel: { table: { disable: true } },
    children: { table: { disable: true } },
    title: { control: "text" },
    description: { control: "text" },
    submitText: { control: "text" },
    cancelText: { control: "text" },
    submitVariant: { control: "inline-radio", options: ["primary", "success"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    maxWidth: { control: "select", options: ["sm", "md", "lg", "xl", "2xl"] },
  },
  args: {
    open: false,
    onOpenChange: () => {},
    onSubmit: () => {},
    title: "新規申請の作成",
    description: "申請の内容を入力してください。",
    submitText: "作成",
    children: null,
  },
} satisfies Meta<typeof FormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

type FormDialogVariation = {
  key: string;
  label: string;
  props: Partial<React.ComponentProps<typeof FormDialog>>;
  error?: string;
};

const FORM_DIALOG_VARIATIONS: FormDialogVariation[] = [
  { key: "default", label: "標準", props: { title: "新規申請の作成" } },
  {
    key: "loading",
    label: "送信中",
    props: { title: "新規申請の作成", loading: true },
  },
  {
    key: "error",
    label: "検証エラー",
    props: { title: "新規申請の作成" },
    error: "件名は必須です",
  },
  {
    key: "disabled",
    label: "送信できない",
    props: { title: "新規申請の作成", disabled: true },
  },
  {
    key: "success",
    label: "承認（success）",
    props: { title: "申請の承認", submitText: "承認する", submitVariant: "success" },
  },
];

/**
 * フォームダイアログの状態を 1 画面から開いて比較する。
 *
 * 押すとその状態のダイアログが開く。`loading` 中は入力ごと無効になることを確認する。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [openKey, setOpenKey] = React.useState<string | null>(null);
    const current = FORM_DIALOG_VARIATIONS.find((v) => v.key === openKey);

    return (
      <Showcase>
        <Section
          title="States"
          note="送信中は loading（フォーム全体が無効になる）。入力不足で送れないときは disabled。"
        >
          <Cluster>
            {FORM_DIALOG_VARIATIONS.map((v) => (
              <Button key={v.key} variant="secondary" onClick={() => setOpenKey(v.key)}>
                {v.label}
              </Button>
            ))}
          </Cluster>
        </Section>

        {current && (
          <FormDialog
            key={current.key}
            title=""
            {...current.props}
            open
            onOpenChange={(next) => !next && setOpenKey(null)}
            onSubmit={(event) => {
              event.preventDefault();
              setOpenKey(null);
            }}
            onCancel={() => setOpenKey(null)}
          >
            <FormField label="件名" required error={current.error}>
              <Input
                name="title"
                placeholder="例: 備品購入の申請"
                error={Boolean(current.error)}
              />
            </FormField>
            <FormField label="優先度" required>
              <Select
                name="priority"
                items={[
                  { value: "high", label: "高" },
                  { value: "mid", label: "中" },
                  { value: "low", label: "低" },
                ]}
                placeholder="優先度を選択"
              />
            </FormField>
          </FormDialog>
        )}
      </Showcase>
    );
  },
};

const PRIORITY_ITEMS = [
  { value: "high", label: "高" },
  { value: "mid", label: "中" },
  { value: "low", label: "低" },
];

/**
 * 基本形。
 *
 * 入力欄に `name` を付けておくと `new FormData(e.currentTarget)` で値が取れる。
 * `Enter` キーでも送信できる（ネイティブ form の挙動）。
 */
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    const [submitted, setSubmitted] = React.useState<Record<string, string> | null>(null);

    return (
      <div className="space-y-3">
        <Button variant="primary" onClick={() => setOpen(true)}>
          新規申請
        </Button>

        {submitted && (
          <pre className="max-w-md overflow-x-auto rounded-lg bg-muted p-3 text-xs">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        )}

        <FormDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          onSubmit={(e) => {
            const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<
              string,
              string
            >;
            setSubmitted(data);
            setOpen(false);
          }}
        >
          <div className="space-y-4">
            <FormField label="件名" required>
              <Input name="title" placeholder="例: 備品購入の申請" required />
            </FormField>

            <FormField label="優先度" required>
              <Select
                name="priority"
                items={PRIORITY_ITEMS}
                placeholder="優先度を選択"
                required
              />
            </FormField>

            <FormField label="金額" required helpText="税込で入力してください">
              <Input name="amount" type="number" min={0} placeholder="0" required />
            </FormField>
          </div>
        </FormDialog>
      </div>
    );
  },
};

/**
 * 非同期送信（`loading`）。
 *
 * `loading` の間は `<fieldset disabled>` により**全入力が無効化**され、
 * `Esc`・背景クリック・× も効かなくなる。2 秒で完了する。
 */
export const Submitting: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          送信を試す（2 秒）
        </Button>
        <FormDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          loading={loading}
          onSubmit={async () => {
            setLoading(true);
            try {
              await new Promise((resolve) => window.setTimeout(resolve, 2000));
              setOpen(false);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="space-y-4">
            <FormField label="件名" required>
              <Input name="title" defaultValue="備品購入（モニター 2 台）" required />
            </FormField>
            <FormField label="優先度" required>
              <Select name="priority" items={PRIORITY_ITEMS} defaultValue="mid" />
            </FormField>
          </div>
        </FormDialog>
      </>
    );
  },
};

/**
 * サーバー側バリデーションエラーの表示。
 *
 * 送信は失敗し、**ダイアログは開いたまま**エラーが表示される。
 * 全体エラーは先頭のアラート、項目エラーは `FormField` の `error` に流す。
 * これが application の `form errors` を React 側で受ける想定の形。
 */
export const WithValidationError: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          送信すると必ず失敗する
        </Button>
        <FormDialog
          {...args}
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setErrors({});
          }}
          onSubmit={async () => {
            setLoading(true);
            try {
              await new Promise((resolve) => window.setTimeout(resolve, 800));
              // application からの { errors: {...} } を想定
              setErrors({
                __all__: "入力内容にエラーがあります。",
                amount: "上限額（100,000 円）を超えています",
              });
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
        >
          <div className="space-y-4">
            {errors.__all__ && (
              <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {errors.__all__}
              </div>
            )}

            <FormField label="件名" required>
              <Input name="title" defaultValue="研修参加費" required />
            </FormField>

            <FormField
              label="金額"
              required
              error={errors.amount}
              helpText="税込で入力してください"
            >
              <Input name="amount" type="number" defaultValue={120000} min={0} />
            </FormField>
          </div>
        </FormDialog>
      </>
    );
  },
};

/**
 * 入力を無効化する例（`disabled`）。
 *
 * 権限がなく閲覧のみの場合など。`loading` と違いボタンにスピナーは出ない。
 * ただし**送信ボタンは押せる**（無効化されるのは fieldset の中身だけ）ため、
 * 閲覧専用にしたい場合は `submitText` を出さない設計を検討する。
 */
export const Disabled: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          閲覧のみで開く
        </Button>
        <FormDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="申請の内容"
          description="承認済みのため編集できません。"
          disabled
          submitText="保存"
          onSubmit={() => setOpen(false)}
        >
          <div className="space-y-4">
            <FormField label="件名">
              <Input name="title" defaultValue="研修参加費" />
            </FormField>
            <FormField label="優先度">
              <Select name="priority" items={PRIORITY_ITEMS} defaultValue="high" />
            </FormField>
          </div>
        </FormDialog>
      </>
    );
  },
};

/** `submitVariant="success"` — 公開・確定を伴う保存に使う。 */
export const SuccessVariant: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="success" onClick={() => setOpen(true)}>
          公開設定
        </Button>
        <FormDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="公開設定"
          description="公開範囲を設定して確定します。"
          submitText="公開する"
          submitVariant="success"
          maxWidth="md"
          onSubmit={() => setOpen(false)}
        >
          <div className="space-y-4">
            <FormField label="公開範囲" required>
              <Select
                name="scope"
                items={[
                  { value: "all", label: "全社" },
                  { value: "dept", label: "所属部署のみ" },
                ]}
                defaultValue="dept"
              />
            </FormField>
            <Checkbox
              name="notify"
              label="公開時に関係者へ通知する"
              description="通知は公開直後に 1 度だけ送信されます。"
              defaultChecked
            />
          </div>
        </FormDialog>
      </>
    );
  },
};

/**
 * 項目が増えてきた場合。
 *
 * これ以上増えるならモーダルをやめて**専用ページに切り替える**。
 * モーダル内をスクロールさせると、上のほうのエラーに気付けなくなる。
 */
export const NearTheLimit: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          5 項目のフォーム
        </Button>
        <FormDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          onSubmit={() => setOpen(false)}
        >
          <div className="space-y-4">
            <FormField label="件名" required>
              <Input name="title" required />
            </FormField>
            <FormField label="優先度" required>
              <Select name="priority" items={PRIORITY_ITEMS} placeholder="優先度を選択" />
            </FormField>
            <FormField label="金額" required helpText="税込">
              <Input name="amount" type="number" min={0} />
            </FormField>
            <FormField label="希望納期">
              <Input name="due" type="date" />
            </FormField>
            <FormField label="備考" helpText="任意">
              <textarea
                name="note"
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
          </div>
        </FormDialog>
      </>
    );
  },
};
