import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ButtonGroup } from "./ButtonGroup";
import { FieldSet } from "./FieldSet";
import { FormField } from "./FormField";
import { RadioGroup } from "./RadioGroup";

const ITEMS = [
  { value: "high", label: "高" },
  { value: "low", label: "低" },
];

/** aria-labelledby / aria-describedby の id を実際の文字列へ解決する */
function resolve(el: Element | null, attr: string): string[] {
  return (el?.getAttribute(attr) ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "");
}

/**
 * グループには `<label for>` が効かない（labelable 要素ではない）。
 * FieldSet は名前を aria-labelledby で結ぶ。
 */
describe("FieldSet", () => {
  const GROUPS = [
    {
      name: "RadioGroup",
      selector: '[data-slot="radio-group"]',
      render: () => <RadioGroup items={ITEMS} name="priority" />,
    },
    {
      name: "ButtonGroup",
      selector: '[data-slot="toggle-group"]',
      render: () => <ButtonGroup items={ITEMS} name="priority" />,
    },
  ] as const;

  describe.each(GROUPS)("$name", ({ selector, render: renderGroup }) => {
    const group = (container: HTMLElement) => container.querySelector(selector);

    it("グループの名前が legend に紐づく", () => {
      const { container } = render(<FieldSet label="優先度">{renderGroup()}</FieldSet>);
      expect(resolve(group(container), "aria-labelledby").join("")).toContain("優先度");
    });

    it("必須は文字でも伝える", () => {
      const { container } = render(
        <FieldSet label="優先度" required>
          {renderGroup()}
        </FieldSet>,
      );
      expect(resolve(group(container), "aria-labelledby").join("")).toContain("（必須）");
    });

    it("error でグループが aria-invalid になり、FieldSet が error 表示へ切り替わる", () => {
      const { container } = render(
        <FieldSet label="優先度" error="優先度を選択してください">
          {renderGroup()}
        </FieldSet>,
      );
      expect(group(container)?.getAttribute("aria-invalid")).toBe("true");
      expect(container.querySelector('[data-slot="field-set"]')?.getAttribute("data-invalid")).toBe(
        "true",
      );
    });

    it("error と helpText がグループの aria-describedby に入る", () => {
      const { container } = render(
        <FieldSet label="優先度" error="選択してください" helpText="後から変更できます">
          {renderGroup()}
        </FieldSet>,
      );
      const texts = resolve(group(container), "aria-describedby");
      expect(texts).toContain("選択してください");
      expect(texts).toContain("後から変更できます");
    });

    it("独自 prop を DOM へ漏らさない", () => {
      const { container } = render(
        <FieldSet label="優先度" error="選択してください">
          {renderGroup()}
        </FieldSet>,
      );
      expect(container.querySelector("[error]")).toBeNull();
    });
  });

  /* cloneElement は undefined でもキーを上書きする。子が自分で持っている
   * aria-* を消してはいけない（子側で管理しているエラー状態が黙って消える）。 */
  it("子が自分で持っている aria-invalid / aria-describedby を消さない", () => {
    const { container } = render(
      <FieldSet label="優先度">
        <RadioGroup items={ITEMS} name="priority" aria-invalid aria-describedby="caller-hint" />
      </FieldSet>,
    );
    const group = container.querySelector('[data-slot="radio-group"]');
    expect(group?.getAttribute("aria-invalid")).toBe("true");
    expect(group?.getAttribute("aria-describedby")).toBe("caller-hint");
  });

  it("FieldSet の error と子の aria-describedby は両方残る", () => {
    const { container } = render(
      <FieldSet label="優先度" error="選択してください">
        <RadioGroup items={ITEMS} name="priority" aria-describedby="caller-hint" />
      </FieldSet>,
    );
    const ids = (
      container.querySelector('[data-slot="radio-group"]')?.getAttribute("aria-describedby") ?? ""
    ).split(" ");
    expect(ids).toContain("caller-hint");
    expect(ids.length).toBe(2);
  });

  /* name だけで id を組むと、同じ name の同じ行を持つフォームが 2 つ
   * （別ダイアログ等）同時に載ったとき id が衝突する。 */
  it("同じ name のグループを 2 つ載せても id が衝突しない", () => {
    const { container } = render(
      <>
        <FieldSet label="優先度 A">
          <RadioGroup items={ITEMS} name="priority" />
        </FieldSet>
        <FieldSet label="優先度 B">
          <RadioGroup items={ITEMS} name="priority" />
        </FieldSet>
      </>,
    );
    const ids = [...container.querySelectorAll("input[name=priority]")].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ラジオグループに読み上げ名が付く", () => {
    render(<FieldSet label="優先度">{GROUPS[0].render()}</FieldSet>);
    expect(screen.getByRole("radiogroup", { name: /優先度/ })).toBeTruthy();
  });

  /* FormField（label + htmlFor）をグループへ使うと、for が
   * 実在しない要素を指し「ラベルはあるのに名前が無い」状態になる。
   * FieldSet を用意した理由なので、その差を固定しておく。 */
  it("FormField ではグループに名前が付かない（FieldSet を使う理由）", () => {
    render(
      <FormField label="優先度">
        <RadioGroup items={ITEMS} name="priority" />
      </FormField>,
    );
    expect(screen.queryByRole("radiogroup", { name: /優先度/ })).toBeNull();
  });
});
