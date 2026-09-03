import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

// <important>
// このファイルは shadcn/ui (base) の button をそのまま取り込んだもの。
// 上流との差分は 2 つあり、どちらも意図的:
//
//   1. `success` バリアントの追加。このリポジトリは --color-success トークンと
//      .btn-success（テンプレート用）を持つため、shadcn の 6 バリアントだけでは
//      表現できない。
//   2. base から `disabled:opacity-50` を外したこと。無効時の見た目は
//      tokens/components.css の「Button の無効状態」が持つ（バリアント色を
//      薄めるのではなく無彩色へ差し替える）。utilities レイヤーの
//      `disabled:opacity-50` は components レイヤーのスキンより必ず強いため、
//      ここに残すと無彩色の面まで一緒に薄まってしまう。
//
// 上流を取り込み直すときは、この 2 点を再適用すること。
// </important>
const buttonVariants = cva(
  "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cn-button-variant-default",
        outline: "cn-button-variant-outline",
        secondary: "cn-button-variant-secondary",
        ghost: "cn-button-variant-ghost",
        destructive: "cn-button-variant-destructive",
        link: "cn-button-variant-link",
        success: "cn-button-variant-success",
      },
      size: {
        default: "cn-button-size-default",
        xs: "cn-button-size-xs",
        sm: "cn-button-size-sm",
        lg: "cn-button-size-lg",
        icon: "cn-button-size-icon",
        "icon-xs": "cn-button-size-icon-xs",
        "icon-sm": "cn-button-size-icon-sm",
        "icon-lg": "cn-button-size-icon-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
