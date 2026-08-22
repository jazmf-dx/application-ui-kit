import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"

import { cn } from '../../lib/utils'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectGroupLabel = SelectPrimitive.GroupLabel

/**
 * トリガー（閉じているときに見える部分）。
 *
 * 見た目は CSS クラスの `select.input-field` に揃えている
 * （padding / border-radius / border 色 / フォーカスリング）。
 * 揃えている理由: 同じ画面に htmx 版の select と React 版の ApplicationSelect が
 * 並んだときに段差が出ないようにするため。
 */
const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectPrimitive.Trigger.Props
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // 地色は `select.input-field`（background-color: var(--color-card)）に合わせる。
      "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors",
      "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
      "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:bg-muted",
      "data-[popup-open]:border-ring",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon className="shrink-0 text-muted-foreground">
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = "SelectTrigger"

/**
 * ドロップダウン本体。Portal + Positioner + Popup をまとめている。
 * DropdownMenuContent と同じ構成にしてある。
 */
const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectPrimitive.Popup.Props &
    Pick<SelectPrimitive.Positioner.Props, "align" | "side" | "sideOffset">
>(({ className, align = "start", side, sideOffset = 4, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      align={align}
      side={side}
      sideOffset={sideOffset}
      className="z-50 outline-none"
      // トリガーと同じ幅にする（select の挙動として自然なため）
      alignItemWithTrigger={false}
    >
      <SelectPrimitive.Popup
        ref={ref}
        className={cn(
          "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      />
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, SelectPrimitive.Item.Props>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
)
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  SelectPrimitive.Separator.Props
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
}
