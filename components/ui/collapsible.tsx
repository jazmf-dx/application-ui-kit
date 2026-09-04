"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

// shadcn/ui (base) の collapsible をそのまま取り込んだもの
// （apps/v4/registry/bases/base/ui/collapsible.tsx）。差分は無し。
// 見出し・開閉アイコンを持たない素の開閉制御。見出し付きの開閉は Accordion を使う。
function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
