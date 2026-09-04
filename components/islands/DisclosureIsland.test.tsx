import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DisclosureIsland } from "./DisclosureIsland";

describe("DisclosureIsland", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("見出しと件数を描き、対象の hidden を切り替える", () => {
    const target = document.createElement("div");
    target.id = "completed";
    target.hidden = true;
    document.body.appendChild(target);

    render(<DisclosureIsland targetId="completed" label="完了したコース" count={12} />);

    const button = screen.getByRole("button", { name: /完了したコース/ });
    expect(screen.getByRole("heading", { level: 2, name: "完了したコース" })).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(target.hidden).toBe(true);

    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(target.hidden).toBe(false);
  });

  it("initialOpen なら最初から開く", () => {
    const target = document.createElement("div");
    target.id = "open-by-default";
    document.body.appendChild(target);
    render(<DisclosureIsland targetId="open-by-default" label="詳細" initialOpen />);
    expect(target.hidden).toBe(false);
    expect(screen.getByRole("button").getAttribute("aria-controls")).toBe("open-by-default");
  });
});
