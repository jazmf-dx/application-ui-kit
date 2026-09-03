/**
 * カラートークン定義（意味 → トークン名の対応表）
 *
 * <important>
 * ここは「値の定義」ではない。値の SSOT は tokens/theme.css の `@theme`。
 * このファイルは Storybook の Foundations や TS 側から
 * 「どんなトークンがあり、どういう意味で、いつ使うのか」を参照するためのメタ情報。
 *
 * CSS 変数の実値をここにハードコードしない（二重管理になり必ず分裂する）。
 * 実際の色は `var(--color-*)` 経由か Tailwind クラス経由で解決する。
 * </important>
 *
 * 出典: tokens/theme.css
 * ルール: design-system/colors.md
 */

/** セマンティックカラーの役割 */
export interface SemanticColor {
  /** トークン名（`--color-` を除いた部分） */
  name: string;
  /** 背景色として使う Tailwind クラス（リテラル文字列。動的組立は禁止） */
  bgClass: string;
  /** 対応する CSS 変数名 */
  token: string;
  /** どういう意味・いつ使うのか */
  usage: string;
}

/**
 * アクションカラー
 *
 * ボタン・操作系の色。1画面に primary は原則1つ。
 * React では `<Button variant="primary">` を使う。
 */
export const ACTION_COLORS: SemanticColor[] = [
  {
    name: "primary",
    bgClass: "bg-primary",
    token: "--color-primary",
    usage: "メインアクション（作成・送信・保存）。1画面に原則1つ",
  },
  {
    name: "secondary",
    bgClass: "bg-secondary",
    token: "--color-secondary",
    usage: "補助操作（キャンセル・戻る）。キャンセルは必ずこれ",
  },
  {
    name: "success",
    bgClass: "bg-success",
    token: "--color-success",
    usage: "保存完了・確定・承認",
  },
  {
    name: "danger",
    bgClass: "bg-danger",
    token: "--color-danger",
    usage: "削除・取り消し不可の操作。削除は必ずこれ",
  },
  {
    name: "warning",
    bgClass: "bg-warning",
    token: "--color-warning",
    usage: "警告・注意喚起",
  },
  {
    name: "info",
    bgClass: "bg-info",
    token: "--color-info",
    usage: "情報表示・補足",
  },
];

/**
 * ベース・ニュートラルカラー
 *
 * 背景・文字・ボーダー。ダークモード時はこれらが `.dark` で上書きされる。
 * 新規コンポーネントはこのトークン群を使うこと（`bg-white` 直書きは dark で破綻する）。
 */
export const BASE_COLORS: SemanticColor[] = [
  {
    name: "background",
    bgClass: "bg-background",
    token: "--color-background",
    usage: "ページ全体の背景",
  },
  {
    name: "foreground",
    bgClass: "bg-foreground",
    token: "--color-foreground",
    usage: "本文テキスト色",
  },
  {
    name: "card",
    bgClass: "bg-card",
    token: "--color-card",
    usage: "カード・パネルの背景。`bg-white` の代わりに使う",
  },
  {
    name: "popover",
    bgClass: "bg-popover",
    token: "--color-popover",
    usage: "ドロップダウン・ポップオーバーの背景",
  },
  {
    name: "muted",
    bgClass: "bg-muted",
    token: "--color-muted",
    usage: "控えめな背景（無効状態・ヘッダー行）",
  },
  {
    name: "muted-foreground",
    bgClass: "bg-muted-foreground",
    token: "--color-muted-foreground",
    usage: "補助テキスト（説明文・プレースホルダー）",
  },
  {
    name: "accent",
    bgClass: "bg-accent",
    token: "--color-accent",
    usage: "ホバー時の淡い強調背景",
  },
  {
    name: "border",
    bgClass: "bg-border",
    token: "--color-border",
    usage: "標準ボーダー。`border-gray-200` の代わりに使う",
  },
  {
    name: "ring",
    bgClass: "bg-ring",
    token: "--color-ring",
    usage: "フォーカスリング",
  },
];

/**
 * ドメインステータスカラー（意味 → Tailwind パレット）
 *
 * ステータス・優先度・種別のバッジに使う。
 * **同じ意味の状態には全アプリで同じ色を使う**（乖離すると統一コストが跳ね上がる）。
 *
 * これらはセマンティックトークンではなく Tailwind パレットを直接使う。
 * 理由: アプリごとに意味の数が違い、トークン化すると破綻するため。
 *
 * 出典: design-system/colors.md の「推奨セマンティクス」表
 */
export const STATUS_COLORS = [
  { meaning: "新規・未対応・要注意", cls: "bg-yellow-50 text-yellow-600" },
  { meaning: "進行中", cls: "bg-sky-50 text-sky-500" },
  { meaning: "完了・解決・承認", cls: "bg-emerald-50 text-emerald-600" },
  { meaning: "差戻し・警告", cls: "bg-orange-50 text-orange-600" },
  { meaning: "緊急・エラー・却下", cls: "bg-rose-50 text-rose-500" },
  { meaning: "終了・無効・アーカイブ", cls: "bg-gray-100 text-gray-500" },
  { meaning: "検討中・保留", cls: "bg-purple-50 text-purple-600" },
] as const;

/**
 * アバターの色
 *
 * ユーザーは blue、システム・匿名は gray に統一する。
 * 出典: design-system/colors.md
 */
export const AVATAR_COLORS = {
  user: "bg-blue-100 text-blue-700",
  system: "bg-gray-200 text-gray-600",
} as const;
