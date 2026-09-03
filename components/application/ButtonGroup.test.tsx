import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ButtonGroup, type ButtonGroupItem } from "./ButtonGroup";
import { FormField } from "./FormField";

const PERIODS: ButtonGroupItem[] = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
];

describe("ButtonGroup", () => {
  it("選択すると onValueChange が呼ばれる", () => {
    const onValueChange = vi.fn();
    render(
      <ButtonGroup
        items={PERIODS}
        defaultValue="day"
        onValueChange={onValueChange}
        aria-label="表示期間"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "週" }));
    expect(onValueChange).toHaveBeenCalledWith("week");
  });

  describe("フォーム送信", () => {
    /* type="hidden" にすると required が検証されない
     * （hidden input は barred from constraint validation）。
     * 未選択のままフォームが valid になり name="" が送信されるため、
     * 視覚的に隠すだけの input であることを固定する。 */
    it("required で未選択ならフォームが invalid になる", () => {
      const { container } = render(
        <form>
          <ButtonGroup items={PERIODS} name="period" required aria-label="表示期間" />
        </form>,
      );
      const form = container.querySelector("form") as HTMLFormElement;
      const field = container.querySelector('input[name="period"]') as HTMLInputElement;

      expect(field.type).not.toBe("hidden");
      expect(field.value).toBe("");
      expect(form.checkValidity()).toBe(false);
    });

    it("選択済みならフォームが valid になり、選択値を送信する", () => {
      const { container } = render(
        <form>
          <ButtonGroup
            items={PERIODS}
            name="period"
            required
            defaultValue="week"
            aria-label="表示期間"
          />
        </form>,
      );
      const form = container.querySelector("form") as HTMLFormElement;
      const field = container.querySelector('input[name="period"]') as HTMLInputElement;

      expect(field.value).toBe("week");
      expect(form.checkValidity()).toBe(true);
    });

    it("送信用の input は Tab の順路と読み上げから外す", () => {
      const { container } = render(
        <ButtonGroup items={PERIODS} name="period" defaultValue="day" aria-label="表示期間" />,
      );
      const field = container.querySelector('input[name="period"]') as HTMLInputElement;
      expect(field.tabIndex).toBe(-1);
      expect(field.getAttribute("aria-hidden")).toBe("true");
      expect(field.className).toContain("sr-only");
    });

    /* aria-hidden な送信用 input へブラウザがフォーカスすると、支援技術には
     * 「どの項目が無効か」も文言も伝わらない。invalid を横取りして、
     * 可視のボタンへフォーカスとエラーを載せ替える。 */
    it("ネイティブ検証が弾いたら可視ボタンへフォーカスとエラーを移す", () => {
      const { container } = render(
        <form>
          <ButtonGroup items={PERIODS} name="period" required aria-label="表示期間" />
        </form>,
      );
      const field = container.querySelector('input[name="period"]') as HTMLInputElement;

      // ブラウザが対話的検証でこの input をフォーカスした状況を作る
      fireEvent.focus(field);

      const group = container.querySelector('[data-slot="toggle-group"]') as HTMLElement;
      expect(group.getAttribute("aria-invalid")).toBe("true");
      expect(document.activeElement?.getAttribute("data-slot")).toBe("toggle-group-item");

      const messageId = group.getAttribute("aria-describedby") as string;
      expect(document.getElementById(messageId)?.textContent).toBe("選択してください");

      // 送信のブロックは維持される
      expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(false);
    });

    it("選択するとネイティブ検証のエラー表示が消える", () => {
      const { container } = render(
        <form>
          <ButtonGroup items={PERIODS} name="period" required aria-label="表示期間" />
        </form>,
      );
      fireEvent.focus(container.querySelector('input[name="period"]') as HTMLInputElement);
      const group = container.querySelector('[data-slot="toggle-group"]') as HTMLElement;
      expect(group.getAttribute("aria-invalid")).toBe("true");

      fireEvent.click(screen.getByRole("button", { name: "週" }));

      expect(group.getAttribute("aria-invalid")).toBeNull();
      expect(group.getAttribute("aria-describedby")).toBeNull();
    });

    /* FormField は error が無いときも aria-invalid: undefined を
     * 渡してくる。rest spread に混ぜると、こちらが立てた aria-invalid が
     * 消える（ブラウザ上でだけ再現し、テストからは見えなかった）。 */
    it("FormField に包まれていても aria-invalid が立つ", () => {
      const { container } = render(
        <form>
          <FormField label="表示期間" required>
            <ButtonGroup items={PERIODS} name="period" required aria-label="表示期間" />
          </FormField>
        </form>,
      );
      fireEvent.focus(container.querySelector('input[name="period"]') as HTMLInputElement);
      const group = container.querySelector('[data-slot="toggle-group"]') as HTMLElement;
      expect(group.getAttribute("aria-invalid")).toBe("true");
    });

    /* checkValidity() も invalid を発火する。そこでフォーカスやエラー表示を
     * 行うと「検証結果を黙って知りたいだけ」の呼び出しで画面が動く。
     * relay は focus 側に置いてあるので動かない。 */
    it("checkValidity() ではフォーカスもエラー表示も動かさない", () => {
      const { container } = render(
        <form>
          <ButtonGroup items={PERIODS} name="period" required aria-label="表示期間" />
        </form>,
      );
      const form = container.querySelector("form") as HTMLFormElement;
      const before = document.activeElement;

      expect(form.checkValidity()).toBe(false);

      expect(document.activeElement).toBe(before);
      expect(
        container.querySelector('[data-slot="toggle-group"]')?.getAttribute("aria-invalid"),
      ).toBeNull();
    });

    it("name が無ければ送信用の input を出さない", () => {
      const { container } = render(
        <ButtonGroup items={PERIODS} defaultValue="day" aria-label="表示期間" />,
      );
      expect(container.querySelector("input[name]")).toBeNull();
    });

    it("required なしなら未選択でも valid", () => {
      const { container } = render(
        <form>
          <ButtonGroup items={PERIODS} name="period" aria-label="表示期間" />
        </form>,
      );
      expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true);
    });
  });
});
