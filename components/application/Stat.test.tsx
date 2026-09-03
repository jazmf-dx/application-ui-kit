import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stat } from "./Stat";

describe("Stat", () => {
  it("ラベル・値・単位を描く", () => {
    render(<Stat label="未対応" value="12" unit="件" />);
    expect(screen.getByText("未対応")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("件").className).toContain("cn-stat-unit");
  });

  it.each([
    ["neutral", "cn-stat-delta-neutral"],
    ["positive", "cn-stat-delta-positive"],
    ["negative", "cn-stat-delta-negative"],
    ["warning", "cn-stat-delta-warning"],
  ] as const)("tone=%s は delta に %s を付ける", (tone, cls) => {
    render(<Stat label="件数" value="1" delta="+1" tone={tone} />);
    expect(screen.getByText("+1").className).toContain(cls);
  });

  it("delta / hint が無ければ描かない", () => {
    const { container } = render(<Stat label="件数" value="1" />);
    expect(container.querySelector(".cn-stat-delta")).toBeNull();
    expect(container.querySelector(".cn-stat-hint")).toBeNull();
  });
});
