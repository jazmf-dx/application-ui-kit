"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

// <important>
// shadcn/ui (base) の accordion を取り込んだもの（apps/v4/registry/bases/base/ui/accordion.tsx）。
// 上流からの差分は 3 点: import パス、アイコンを IconPlaceholder 2 個ではなく lucide の
// ChevronDown 1 個を回転させる形にしたこと、開閉アニメーションを持たないこと
// （Base UI の data-starting-style / data-ending-style 用の variant をこのリポジトリは
// 定義していないため。必要になったら tokens/tokens.css に variant を足してから戻す）。
// 見た目は tokens/components.css の cn-accordion* が持ち、テンプレート用の
// <details class="disclosure"> と揃えてある。
// </important>
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("cn-accordion flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("cn-accordion-item", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-center justify-between border border-transparent transition-all outline-none aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown
          data-slot="accordion-trigger-icon"
          aria-hidden="true"
          className="cn-accordion-trigger-icon pointer-events-none shrink-0 transition-transform group-aria-expanded/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="cn-accordion-content overflow-hidden"
      {...props}
    >
      <div
        className={cn(
          "cn-accordion-content-inner [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
