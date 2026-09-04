import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Steps } from "./Steps";

const ITEMS = [
  { label: "取り込み" },
  { label: "加工", description: "列を整える" },
  { label: "出力" },
];

describe("Steps", () => {
  it("current から done / current / upcoming を決め、現在に aria-current=step を付ける", () => {
    render(<Steps items={ITEMS} current={1} />);
    const steps = screen.getAllByRole("listitem");
    expect(steps[0].getAttribute("data-status")).toBe("done");
    expect(steps[1].getAttribute("data-status")).toBe("current");
    expect(steps[1].getAttribute("aria-current")).toBe("step");
    expect(steps[2].getAttribute("data-status")).toBe("upcoming");
  });

  it("項目の status が優先される", () => {
    render(<Steps items={[{ label: "A", status: "error" }, { label: "B" }]} current={1} />);
    expect(screen.getAllByRole("listitem")[0].getAttribute("data-status")).toBe("error");
  });

  it("onStepClick があれば done の手順だけボタンになる", () => {
    const onStepClick = vi.fn();
    render(<Steps items={ITEMS} current={1} onStepClick={onStepClick} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /取り込み/ }));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it("orientation を data 属性に出す", () => {
    render(<Steps items={ITEMS} orientation="vertical" />);
    expect(screen.getByRole("list").getAttribute("data-orientation")).toBe("vertical");
  });
});
