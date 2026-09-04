import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("showCount で文字数カウンタを出し、入力で更新する", () => {
    render(<Textarea aria-label="備考" maxLength={10} showCount />);
    expect(screen.getByText("0 / 10")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "備考" }), {
      target: { value: "あいう" },
    });
    expect(screen.getByText("3 / 10")).toBeTruthy();
  });

  it("controlled でも value の長さを描く", () => {
    render(
      <Textarea aria-label="備考" value="12345" onChange={() => {}} maxLength={5} showCount />,
    );
    expect(screen.getByText("5 / 5")).toBeTruthy();
  });

  it("error は aria-invalid になる", () => {
    render(<Textarea aria-label="備考" error />);
    expect(screen.getByRole("textbox", { name: "備考" }).getAttribute("aria-invalid")).toBe("true");
  });

  it("showCount が無ければ wrapper を作らない", () => {
    const { container } = render(<Textarea aria-label="備考" />);
    expect(container.firstElementChild?.tagName).toBe("TEXTAREA");
  });
});

describe("Input showCount", () => {
  it("入力欄の右端にカウンタを出す", () => {
    render(<Input aria-label="件名" maxLength={50} showCount defaultValue="abc" />);
    expect(screen.getByText("3 / 50")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "件名" }), { target: { value: "abcd" } });
    expect(screen.getByText("4 / 50")).toBeTruthy();
  });
});
