/**
 * ConfirmDialog - 共有 UI ライブラリの確認ダイアログコンポーネント
 *
 * 削除・編集・公開・アーカイブなど、ユーザーの操作確認が必要な場面で使用します。
 * Dialog をベースに、確認ダイアログ専用の Props を提供します。
 *
 * 画面側では ConfirmDialog のみを使用してください（Dialog を直接使わない）。
 * ローディング状態・エラー表示はコンポーネント内部で完結します。呼び出し側は
 * `onConfirm` に非同期関数を渡すだけで済みます（Promise を返せば自動でハンドリングされます）。
 */

import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import * as React from "react";
import { Dialog } from "./Dialog";

export interface ConfirmDialogProps {
  /**
   * ダイアログの開閉状態
   */
  open: boolean;

  /**
   * ダイアログを閉じるコールバック
   */
  onOpenChange: (open: boolean) => void;

  /**
   * ダイアログのタイトル
   */
  title: string;

  /**
   * 確認メッセージ
   */
  message: string;

  /**
   * 詳細メッセージ（オプション）
   */
  detail?: string;

  /**
   * 確認ダイアログのタイプ
   * - info: 情報確認（青）
   * - warning: 警告確認（オレンジ）
   * - danger: 危険な操作確認（削除など・赤）
   * - success: 公開・確定などの前向きな操作確認（緑）
   * @default "info"
   */
  type?: "info" | "warning" | "danger" | "success";

  /**
   * 確定ボタンのテキスト
   * @default "OK"
   */
  confirmText?: string;

  /**
   * キャンセルボタンのテキスト
   * @default "キャンセル"
   */
  cancelText?: string;

  /**
   * 確定ボタンクリック時のコールバック
   *
   * - Promise を返した場合、解決するまで自動でローディング表示・ボタン無効化を行う
   * - 成功（resolve）した場合は自動的にダイアログを閉じる
   * - 失敗（reject）した場合はダイアログを閉じずにエラーメッセージを表示する
   *   （Error インスタンスなら `.message`、文字列ならそのまま表示）
   */
  onConfirm: () => void | Promise<void>;

  /**
   * キャンセルボタンクリック時のコールバック（オプション）
   * 指定しない場合は単にダイアログを閉じる
   */
  onCancel?: () => void;
}

/**
 * タイプ別の見た目設定
 */
const TYPE_CONFIG = {
  /* 色は Semantic Token のみ（raw palette を使わない）。面は同じ色の 10% で導出するので
   * light / dark の切り分けが要らない。Alert の tone と同じ対応。 */
  info: {
    icon: Info,
    iconClassName: "text-primary",
    iconBg: "bg-primary/10",
    confirmVariant: "primary" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: "text-warning-hover",
    iconBg: "bg-warning/10",
    confirmVariant: "primary" as const,
  },
  danger: {
    icon: AlertTriangle,
    iconClassName: "text-danger",
    iconBg: "bg-danger/10",
    confirmVariant: "danger" as const,
  },
  success: {
    icon: CheckCircle,
    iconClassName: "text-success-hover",
    iconBg: "bg-success/10",
    confirmVariant: "success" as const,
  },
} as const;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "処理に失敗しました。もう一度お試しください。";
}

/**
 * ConfirmDialog コンポーネント
 *
 * @example
 * ```tsx
 * // 削除確認（danger） - 既存 application View への削除リクエストをそのまま渡すだけ
 * const [open, setOpen] = useState(false)
 *
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   type="danger"
 *   title="削除確認"
 *   message="このタスクを削除してもよろしいですか？"
 *   detail="削除すると元に戻せません。"
 *   confirmText="削除"
 *   onConfirm={async () => {
 *     const res = await fetch(deleteUrl, { method: "POST", headers: request-securityHeaders })
 *     if (!res.ok) throw new Error("削除に失敗しました")
 *   }}
 * />
 *
 * // 公開確認（success）
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   type="success"
 *   title="公開確認"
 *   message="このプロジェクトを公開しますか？"
 *   confirmText="公開"
 *   onConfirm={handlePublish}
 * />
 *
 * // アーカイブ確認（warning）
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   type="warning"
 *   title="アーカイブ確認"
 *   message="このアイデアをアーカイブしますか？"
 *   confirmText="アーカイブ"
 *   onConfirm={handleArchive}
 * />
 * ```
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  message,
  detail,
  type = "info",
  confirmText = "OK",
  cancelText = "キャンセル",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // ダイアログを開くたびにエラー表示をリセットする
  React.useEffect(() => {
    if (open) setErrorMessage(null);
  }, [open]);

  const typeConfig = TYPE_CONFIG[type];
  const Icon = typeConfig.icon;

  const handleOpenChange = (next: boolean) => {
    if (isConfirming && !next) return;
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    setErrorMessage(null);
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    if (isConfirming) return;
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmVariant={typeConfig.confirmVariant}
      confirmLoading={isConfirming}
      maxWidth="md"
    >
      <div className="flex gap-4">
        {/* アイコン */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full ${typeConfig.iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${typeConfig.iconClassName}`} />
        </div>

        {/* メッセージ */}
        <div className="flex-1">
          <p className="text-sm text-foreground">{message}</p>
          {detail && <p className="mt-2 text-sm text-muted-foreground">{detail}</p>}

          {errorMessage && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
              <p className="text-sm text-danger">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
