import type { Meta, StoryObj } from "@storybook/react-vite";
import { Redo2, Save, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import * as React from "react";
import { Badge, Button, ButtonGroup, Separator } from "../../components/application";
import { FocusShell } from "./_shell";

/**
 * Focus App — 座席表、エディタ、キャンバス型ツール。
 *
 * Minimal Header（アプリ名 + 主操作 / Toolbar + User Menu）+ Main Workspace（残り全部）。
 */
const meta = {
  title: "テンプレート/フォーカスアプリ（Focus App）",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component: `
## 目的

Application UI Standard §7 の **Focus App** の実物。座席表・エディタ・キャンバス型ツールの起点。

\`\`\`
+--------------------------------------------------------------+
| Minimal Header: [アプリ名] [主操作 / Toolbar]      [User Menu] |
+--------------------------------------------------------------+
| Main Workspace（残り全部を広く使う）                          |
+--------------------------------------------------------------+
\`\`\`

## 注意事項

- 主要操作は Header または一貫した Toolbar に集約する。作業領域の中に散らさない
- User Menu の位置（右端）は他のプロファイルと変えない
- 保存状態（未保存 / 保存済み）は Header 内に常時見せる
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 座席表エディタ風のワークスペース。 */
export const Workspace: Story = {
  render: () => {
    const [tool, setTool] = React.useState("select");
    const [zoom, setZoom] = React.useState(100);
    return (
      <FocusShell
        appName="座席表エディタ"
        toolbar={
          <>
            <ButtonGroup
              variant="primary"
              size="sm"
              value={tool}
              onValueChange={(v) => v && setTool(String(v))}
              items={[
                { value: "select", label: "選択" },
                { value: "desk", label: "机" },
                { value: "wall", label: "壁" },
                { value: "text", label: "文字" },
              ]}
              aria-label="ツール"
            />
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button variant="ghost" size="icon-sm" aria-label="元に戻す">
              <Undo2 />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="やり直す">
              <Redo2 />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button variant="ghost" size="icon-sm" aria-label="縮小" onClick={() => setZoom((z) => Math.max(25, z - 25))}>
              <ZoomOut />
            </Button>
            <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">{zoom}%</span>
            <Button variant="ghost" size="icon-sm" aria-label="拡大" onClick={() => setZoom((z) => Math.min(200, z + 25))}>
              <ZoomIn />
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Badge tone="warning">未保存</Badge>
              <Button size="sm" leftIcon={<Save />}>
                保存
              </Button>
            </div>
          </>
        }
      >
        <div
          className="absolute inset-0 overflow-auto"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: `${(24 * zoom) / 100}px ${(24 * zoom) / 100}px`,
          }}
        >
          <div className="grid grid-cols-4 gap-6 p-10" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex h-16 items-center justify-center rounded-md border border-border bg-card text-xs text-muted-foreground shadow-sm">
                {i === 4 ? "山田" : i === 7 ? "鈴木" : `席 ${i + 1}`}
              </div>
            ))}
          </div>
        </div>
      </FocusShell>
    );
  },
};
