import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { TreeSelect, type TreeSelectItem, findTreePath } from "./TreeSelect";

const UNITS: TreeSelectItem[] = [
  {
    value: "hq",
    label: "本社",
    children: [
      { value: "sales", label: "営業部" },
      {
        value: "it",
        label: "情報システム部",
        badge: "鈴木",
        children: [
          { value: "core", label: "基幹システム課" },
          { value: "infra", label: "インフラ課", disabled: true },
        ],
      },
    ],
  },
  { value: "factory", label: "工場" },
];

// Base UI はポインタイベントの座標を見るため、happy-dom ではトリガーを click で開く。
const openPanel = async () => {
  const trigger = screen.getByRole("combobox");
  fireEvent.click(trigger);
  await waitFor(() => expect(screen.getByText("工場")).toBeTruthy());
  return trigger;
};

describe("findTreePath", () => {
  it("ルートから対象までの経路を返す", () => {
    expect(findTreePath(UNITS, "core")?.map((n) => n.value)).toEqual(["hq", "it", "core"]);
  });

  it("ルート直下も 1 要素の経路になる", () => {
    expect(findTreePath(UNITS, "factory")?.map((n) => n.value)).toEqual(["factory"]);
  });

  it("見つからなければ null を返す", () => {
    expect(findTreePath(UNITS, "unknown")).toBeNull();
  });
});

describe("TreeSelect のフォーム送信", () => {
  /* hidden input は制約検証の対象外なので、required を付けても
   * 未選択でフォームが valid になってしまう。実際に検証されることを固定する。 */
  it("required で未選択ならフォームが invalid になる", () => {
    const { container } = render(
      <form>
        <TreeSelect items={UNITS} name="unit" required aria-label="組織" />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    const field = container.querySelector('input[name="unit"]') as HTMLInputElement;
    expect(field.type).not.toBe("hidden");
    expect(field.value).toBe("");
    expect(field.checkValidity()).toBe(false);
    expect(form.checkValidity()).toBe(false);
  });

  it("選択済みならフォームが valid になり、選択値を送信する", async () => {
    const { container } = render(
      <form>
        <TreeSelect items={UNITS} name="unit" required defaultValue="sales" aria-label="組織" />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    const field = container.querySelector('input[name="unit"]') as HTMLInputElement;
    expect(field.value).toBe("sales");
    expect(form.checkValidity()).toBe(true);
  });

  /* aria-hidden な送信用 input へブラウザがフォーカスすると、支援技術には
   * 「どの項目が無効か」も文言も伝わらない。invalid を横取りして、
   * 可視のトリガーへフォーカスとエラーを載せ替える。 */
  it("ネイティブ検証が弾いたら可視トリガーへフォーカスとエラーを移す", () => {
    const { container } = render(
      <form>
        <TreeSelect items={UNITS} name="unit" required aria-label="組織" />
      </form>,
    );
    const field = container.querySelector('input[name="unit"]') as HTMLInputElement;
    const trigger = screen.getByRole("combobox");

    // ブラウザが対話的検証でこの input をフォーカスした状況を作る
    fireEvent.focus(field);

    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-invalid")).toBe("true");

    const messageId = trigger.getAttribute("aria-describedby") as string;
    expect(messageId).toBeTruthy();
    const message = document.getElementById(messageId);
    // ブラウザの validationMessage を出す。空を返す環境では代替文言を出し、
    // 「赤いだけで何も書いていない」表示にはしない
    expect(message?.textContent).toBe("選択してください");

    // 送信のブロックは維持される
    expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(false);
  });

  it("選択するとネイティブ検証のエラー表示が消える", async () => {
    const { container } = render(
      <form>
        <TreeSelect items={UNITS} name="unit" required aria-label="組織" />
      </form>,
    );
    fireEvent.focus(container.querySelector('input[name="unit"]') as HTMLInputElement);
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");

    fireEvent.click(trigger);
    await waitFor(() => expect(screen.getByText("工場")).toBeTruthy());
    fireEvent.click(screen.getByText("工場"));

    expect(trigger.getAttribute("aria-invalid")).toBeNull();
    expect(trigger.getAttribute("aria-describedby")).toBeNull();
  });

  it("呼び出し側が既にエラーを出しているときは文言を重ねない", () => {
    const { container } = render(
      <form>
        <TreeSelect
          items={UNITS}
          name="unit"
          required
          error
          aria-describedby="caller-error"
          aria-label="組織"
        />
      </form>,
    );
    fireEvent.focus(container.querySelector('input[name="unit"]') as HTMLInputElement);
    const trigger = screen.getByRole("combobox");

    // フォーカスと aria-invalid は引き受けるが、文言は呼び出し側のものだけ
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-describedby")).toBe("caller-error");
  });

  /* checkValidity() も invalid を発火する。そこでフォーカスやエラー表示を
   * 行うと「検証結果を黙って知りたいだけ」の呼び出しで画面が動く。
   * relay は focus 側に置いてあるので動かない。 */
  it("checkValidity() ではフォーカスもエラー表示も動かさない", () => {
    const { container } = render(
      <form>
        <TreeSelect items={UNITS} name="unit" required aria-label="組織" />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    const before = document.activeElement;

    expect(form.checkValidity()).toBe(false);

    expect(document.activeElement).toBe(before);
    expect(screen.getByRole("combobox").getAttribute("aria-invalid")).toBeNull();
  });

  it("required なしなら未選択でも valid", () => {
    const { container } = render(
      <form>
        <TreeSelect items={UNITS} name="unit" aria-label="組織" />
      </form>,
    );
    expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true);
  });
});

describe("TreeSelect", () => {
  it("未選択のときは placeholder を出す", () => {
    render(<TreeSelect items={UNITS} placeholder="組織を選択" aria-label="組織" />);
    expect(screen.getByRole("combobox").textContent).toContain("組織を選択");
  });

  it("選択すると onValueChange が呼ばれる", async () => {
    const onValueChange = vi.fn();
    render(<TreeSelect items={UNITS} onValueChange={onValueChange} aria-label="組織" />);
    await openPanel();

    fireEvent.click(screen.getByText("工場"));
    expect(onValueChange).toHaveBeenCalledWith("factory");
  });

  it("非制御でも選択がトリガーへ反映される", async () => {
    render(<TreeSelect items={UNITS} aria-label="組織" />);
    await openPanel();

    fireEvent.click(screen.getByText("工場"));
    await waitFor(() => expect(screen.getByRole("combobox").textContent).toContain("工場"));
  });

  it("showPath でルートからの経路を表示する", () => {
    const { rerender } = render(<TreeSelect items={UNITS} value="core" aria-label="組織" />);
    expect(screen.getByRole("combobox").textContent).toContain(
      "本社 / 情報システム部 / 基幹システム課",
    );

    rerender(<TreeSelect items={UNITS} value="core" showPath={false} aria-label="組織" />);
    const label = screen.getByRole("combobox").textContent ?? "";
    expect(label).toContain("基幹システム課");
    expect(label).not.toContain("本社 /");
  });

  it("ホバーした親の子階層が次の列に開く", async () => {
    render(<TreeSelect items={UNITS} aria-label="組織" />);
    await openPanel();

    fireEvent.mouseEnter(screen.getByText("本社"));
    await waitFor(() => expect(screen.getByText("情報システム部")).toBeTruthy());
    expect(screen.queryByText("基幹システム課")).toBeNull();

    fireEvent.mouseEnter(screen.getByText("情報システム部"));
    await waitFor(() => expect(screen.getByText("基幹システム課")).toBeTruthy());
  });

  it("子を持たない項目へ移ると開いていた列が閉じる", async () => {
    render(<TreeSelect items={UNITS} aria-label="組織" />);
    await openPanel();

    fireEvent.mouseEnter(screen.getByText("本社"));
    await waitFor(() => expect(screen.getByText("営業部")).toBeTruthy());

    fireEvent.mouseEnter(screen.getByText("工場"));
    await waitFor(() => expect(screen.queryByText("営業部")).toBeNull());
  });

  it("leafOnly のとき子を持つ項目は選択できない", async () => {
    const onValueChange = vi.fn();
    render(<TreeSelect items={UNITS} leafOnly onValueChange={onValueChange} aria-label="組織" />);
    await openPanel();

    fireEvent.click(screen.getByText("本社"));
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("工場"));
    expect(onValueChange).toHaveBeenCalledWith("factory");
  });

  it("disabled な項目は選択できない", async () => {
    const onValueChange = vi.fn();
    render(<TreeSelect items={UNITS} onValueChange={onValueChange} aria-label="組織" />);
    await openPanel();

    fireEvent.mouseEnter(screen.getByText("本社"));
    await waitFor(() => expect(screen.getByText("情報システム部")).toBeTruthy());
    fireEvent.mouseEnter(screen.getByText("情報システム部"));
    await waitFor(() => expect(screen.getByText("インフラ課")).toBeTruthy());

    fireEvent.click(screen.getByText("インフラ課"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("maxLevels を超える階層は開かない", async () => {
    render(<TreeSelect items={UNITS} maxLevels={2} aria-label="組織" />);
    await openPanel();

    fireEvent.mouseEnter(screen.getByText("本社"));
    await waitFor(() => expect(screen.getByText("情報システム部")).toBeTruthy());
    fireEvent.mouseEnter(screen.getByText("情報システム部"));

    // 3 階層目にあたる子は maxLevels=2 では列に出ない
    await waitFor(() => expect(screen.queryByText("基幹システム課")).toBeNull());
  });

  /* type="hidden" にすると required が検証されない（「フォーム送信」describe 参照）。
   * 視覚的に隠すだけの input であることを固定する。 */
  it("name を渡すとフォーム送信用の input を出す（hidden にはしない）", () => {
    const { container } = render(
      <TreeSelect items={UNITS} name="unit" value="core" aria-label="組織" />,
    );
    const field = container.querySelector<HTMLInputElement>('input[name="unit"]');
    expect(field?.value).toBe("core");
    expect(field?.type).not.toBe("hidden");
    expect(field?.className).toContain("sr-only");
    expect(field?.getAttribute("aria-hidden")).toBe("true");
    expect(field?.tabIndex).toBe(-1);
  });

  it("name が無ければ送信用の input を出さない", () => {
    const { container } = render(<TreeSelect items={UNITS} aria-label="組織" />);
    expect(container.querySelector("input[name]")).toBeNull();
  });

  it("error のとき aria-invalid が付く", () => {
    render(<TreeSelect items={UNITS} error aria-label="組織" />);
    expect(screen.getByRole("combobox").getAttribute("aria-invalid")).toBe("true");
  });
});
