import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileQuestion, Lock, ServerCrash } from "lucide-react";
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../components/application";
import { SimpleShell } from "./_shell";

/**
 * エラーページ（404 / 403 / 500）。画面全体が使えないときの表現。
 */
const meta = {
  title: "テンプレート/エラーページ",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component: `
## 目的

ページ自体が表示できないときの画面を固定する（Application UI Standard §4「Error State / Error Page」）。
Django の \`404.html\` / \`403.html\` / \`500.html\` に置く。テンプレート版も下に示す。

| 決めごと | ルール |
|---|---|
| 何が起きたか | 利用者の言葉で 1 行。HTTP のコードは小さく添える |
| 次にできること | 戻る・ホーム・問い合わせの導線を必ず置く |
| 問い合わせ用の識別子 | 500 ではリクエスト ID を小さく添える（内部例外や stack trace は出さない） |
| シェル | ログイン不要のページなので Simple App の Header だけ（Sidebar を出さない） |

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 画面の一部だけ失敗した | 「パターン/エラー表示」（壊れた範囲だけを壊す） |
| データが 0 件 | 「パターン/空の状態」 |
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ErrorScreen({
  icon,
  code,
  title,
  description,
  actions,
  requestId,
}: {
  icon: React.ReactNode;
  code: string;
  title: string;
  description: string;
  actions: React.ReactNode;
  requestId?: string;
}) {
  return (
    <SimpleShell appName="DX ポータル">
      <div className="flex min-h-[480px] items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia>{icon}</EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap justify-center gap-2">{actions}</div>
            <p className="mt-4 text-xs text-muted-foreground">
              エラーコード {code}
              {requestId && <> · リクエスト ID {requestId}</>}
            </p>
          </EmptyContent>
        </Empty>
      </div>
    </SimpleShell>
  );
}

/** 404: ページが見つからない。 */
export const NotFound: Story = {
  render: () => (
    <ErrorScreen
      icon={<FileQuestion />}
      code="404"
      title="ページが見つかりません"
      description="URL が変わったか、削除された可能性があります。アドレスを確認するか、ホームから探し直してください。"
      actions={
        <>
          <Button variant="secondary" onClick={() => history.back()}>
            前のページに戻る
          </Button>
          <Button variant="primary">ホームへ</Button>
        </>
      }
    />
  ),
};

/** 403: 権限がない。 */
export const Forbidden: Story = {
  render: () => (
    <ErrorScreen
      icon={<Lock />}
      code="403"
      title="このページを表示する権限がありません"
      description="閲覧には担当部署の権限が必要です。必要な場合は管理者に権限の付与を依頼してください。"
      actions={
        <>
          <Button variant="secondary">ホームへ</Button>
          <Button variant="primary">管理者に問い合わせる</Button>
        </>
      }
    />
  ),
};

/** 500: サーバーエラー。リクエスト ID を添える。 */
export const ServerError: Story = {
  render: () => (
    <ErrorScreen
      icon={<ServerCrash />}
      code="500"
      title="処理中にエラーが発生しました"
      description="時間をおいて再度お試しください。続く場合は、下のリクエスト ID を添えて情シスデスクへ連絡してください。"
      requestId="a1b2c3d4"
      actions={
        <>
          <Button variant="secondary" onClick={() => location.reload()}>
            再読み込み
          </Button>
          <Button variant="primary">情シスデスクへ連絡</Button>
        </>
      }
    />
  ),
};

/** テンプレート版（404.html）。素の HTML とテンプレート用クラスだけ。 */
export const TemplateVersion: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="sb-unstyled mx-auto max-w-lg py-16 text-center">
      <p className="page-header-title mb-2">ページが見つかりません</p>
      <p className="text-sm text-muted-foreground">
        URL が変わったか、削除された可能性があります。アドレスを確認するか、ホームから探し直してください。
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <a href="#" className="btn-secondary">
          前のページに戻る
        </a>
        <a href="#" className="btn-primary">
          ホームへ
        </a>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">エラーコード 404</p>
    </div>
  ),
};
