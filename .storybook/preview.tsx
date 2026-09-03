import * as React from 'react'
import type { Preview, Decorator } from '@storybook/react-vite'
import { Toaster } from '../components/application'
import './storybook.css'

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as 'light' | 'dark'

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    // プレビュー iframe の地色もテーマに追従させる
    document.body.style.backgroundColor =
      theme === 'dark' ? 'oklch(0.208 0.014 285.938)' : 'oklch(1 0 0)'
    return () => root.classList.remove('dark')
  }, [theme])

  return (
    <div className="app-preview font-sans p-6">
      <Story />
      {/* トーストは常時マウントが前提（実アプリではルートレイアウトに 1 つ） */}
      <Toaster />
    </div>
  )
}

const preview: Preview = {
  decorators: [withTheme],

  globalTypes: {
    theme: {
      description: 'ライト / ダーク切替',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    layout: 'fullscreen',

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // アクセシビリティ検査を全 Story で実行する。
    // 違反があっても Story は表示されるが、a11y パネルに警告が出る。
    a11y: { test: 'todo' },

    // レスポンシブ確認用。実アプリの想定ブレークポイントに合わせる。
    viewport: {
      options: {
        mobile: { name: 'Mobile (sm)', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet (md)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (lg)', styles: { width: '1280px', height: '800px' } },
      },
    },

    options: {
      /*
       * サイドバーの並び。
       * Getting Started → Foundations → Components → Patterns → Templates → Gallery の順に置く。
       *
       * <important>
       * 各コンポーネント内で Overview が先頭に来るのは、**Story ファイルの先頭に
       * Overview を書いているから**。ここに列挙しているのはセクションの順序だけで、
       * 一覧にない名前（Components 配下の各コンポーネント、各ファイルの Story）は
       * Storybook が収集した順（ファイル名の昇順、ファイル内では定義順）のまま並ぶ。
       * Overview を先頭に出したいときは、比較関数ではなくファイル内の位置で表現する。
       * </important>
       *
       * <important>
       * storySort に**関数を書かない**。Storybook は index を作る前に preview の AST から
       * この値だけを取り出して評価するため、関数だと
       *   - 外で定義した定数・関数を参照した時点で「Unexpected 'storySort'」で落ちる
       *   - TS の型注釈を書くと eval が構文エラーになる
       * という壊れ方をする。どちらも `bun run storybook` では
       * 「Unable to index files」だけがブラウザに出て原因が分かりにくい。
       * 配列・オブジェクト形式は静的に解析されるため、この失敗が起きない。
       * </important>
       */
      storySort: {
        order: [
          'Getting Started',
          'Foundations',
          ['Colors', 'Typography', 'Spacing', 'Radius & Shadow', 'Icons'],
          'Components',
          'Patterns',
          'Templates',
          '*',
          'Gallery',
        ],
      },
    },
  },
}

export default preview
