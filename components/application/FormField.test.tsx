import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "./Checkbox";
import { Combobox } from "./Combobox";
import { DatePicker } from "./DatePicker";
import { FormField } from "./FormField";
import { Input } from "./Input";
import { ScopeSearch } from "./ScopeSearch";
import { Select } from "./Select";

/**
 * shadcn/ui のエラー表現は 2 本立てで、両方が必要。
 *
 *   Field に data-invalid   … 見た目（.cn-field の data-[invalid=true]）
 *   コントロールに aria-invalid … 支援技術
 *
 * どちらも「独自 prop を挟まない」ことが前提なので、注入するのは標準属性だけ。
 * 個別コンポーネントの test では気づけない結線なので、ここで横断的に固定する。
 */

const ITEMS = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

/** FormField の子として現実的に渡されるもの */
const CONTROLS = [
  { name: "Input", render: () => <Input /> },
  { name: "Select", render: () => <Select items={ITEMS} /> },
  { name: "Combobox", render: () => <Combobox items={ITEMS} /> },
  { name: "Textarea", render: () => <Textarea /> },
  { name: "DatePicker", render: () => <DatePicker /> },
  {
    name: "ScopeSearch",
    render: () => <ScopeSearch items={[]} placeholder="検索" />,
  },
] as const;

/** Field（role="group" + data-slot="field"）を取り出す */
function field(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-slot="field"]') as HTMLElement;
}

/** aria-invalid が付いた要素（= 各部品が「自分のコントロール」と決めた要素） */
function invalidControl(container: HTMLElement): HTMLElement | null {
  return container.querySelector("[aria-invalid]");
}

describe("FormField × 各コントロールの結線", () => {
  describe.each(CONTROLS)("$name", ({ render: renderControl }) => {
    it("error があると Field に data-invalid が付く", () => {
      const { container } = render(
        <FormField label="件名" error="入力してください">
          {renderControl()}
        </FormField>,
      );
      expect(field(container).getAttribute("data-invalid")).toBe("true");
    });

    it("error が無ければ data-invalid を付けない", () => {
      const { container } = render(<FormField label="件名">{renderControl()}</FormField>);
      expect(field(container).hasAttribute("data-invalid")).toBe(false);
    });

    it("error があるとコントロールに aria-invalid が付く", () => {
      const { container } = render(
        <FormField label="件名" error="入力してください">
          {renderControl()}
        </FormField>,
      );
      expect(invalidControl(container)?.getAttribute("aria-invalid")).toBe("true");
    });

    /* 以前は独自 prop の `error` も注入しており、受け取らない子では DOM へ漏れて
     * React が毎レンダー警告していた（vitest.setup.ts がその警告を落とす）。 */
    it("独自 prop の error を DOM へ漏らさない", () => {
      const { container } = render(
        <FormField label="件名" error="入力してください">
          {renderControl()}
        </FormField>,
      );
      expect(container.querySelector("[error]")).toBeNull();
    });

    it("ラベルの htmlFor が実在する要素を指す", () => {
      const { container } = render(<FormField label="件名">{renderControl()}</FormField>);
      const htmlFor = container.querySelector("label")?.getAttribute("for");
      expect(htmlFor).toBeTruthy();
      expect(document.getElementById(htmlFor as string)).not.toBeNull();
    });

    it("error と helpText の id が aria-describedby に入る", () => {
      const { container } = render(
        <FormField label="件名" error="入力してください" helpText="50文字以内">
          {renderControl()}
        </FormField>,
      );
      const describedBy = container
        .querySelector("[aria-describedby]")
        ?.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      for (const id of (describedBy as string).split(" ")) {
        expect(document.getElementById(id)?.textContent).toBeTruthy();
      }
    });
  });

  /* FormField は error が無いときも aria-invalid: undefined を注入する。
   * 受け取り側が `{...props}` を後に spread していると、自前で立てた aria-invalid が
   * 消える。ButtonGroup で一度踏んでいる不具合なので全部品で固定する。 */
  describe("コントロール側の error を潰さない（spread 順の回帰）", () => {
    it("Input", () => {
      const { container } = render(
        <FormField label="件名">
          <Input error />
        </FormField>,
      );
      expect(container.querySelector("input")?.getAttribute("aria-invalid")).toBe("true");
    });

    it("Select", () => {
      render(
        <FormField label="部署">
          <Select items={ITEMS} error />
        </FormField>,
      );
      expect(screen.getByRole("combobox").getAttribute("aria-invalid")).toBe("true");
    });

    it("Combobox", () => {
      render(
        <FormField label="部署">
          <Combobox items={ITEMS} error aria-label="部署" />
        </FormField>,
      );
      expect(screen.getByRole("combobox").getAttribute("aria-invalid")).toBe("true");
    });
  });

  /* Checkbox は description との紐付けを自前で持つ。注入された
   * aria-describedby で上書きすると、その description が読まれなくなる。 */
  it("Checkbox は自前の description との紐付けを保つ", () => {
    const { container } = render(
      <FormField label="通知" helpText="あとから変更できます">
        <Checkbox label="メール通知" description="重要な更新のみ送ります" />
      </FormField>,
    );
    const ids = (
      container.querySelector("[role=checkbox]")?.getAttribute("aria-describedby") ?? ""
    ).split(" ");
    const texts = ids.map((id) => document.getElementById(id)?.textContent);
    expect(texts).toContain("重要な更新のみ送ります");
    expect(texts).toContain("あとから変更できます");
  });

  it("単体利用（FormField 無し）でも error が aria-invalid になる", () => {
    render(<Select items={ITEMS} error aria-label="部署" />);
    expect(screen.getByRole("combobox").getAttribute("aria-invalid")).toBe("true");
  });
});
