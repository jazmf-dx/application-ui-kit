import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionList } from "./DescriptionList";

describe("DescriptionList", () => {
  it("項目名と値を dt / dd で描く", () => {
    render(<DescriptionList items={[{ term: "申請番号", description: "SYS-2026-0001" }]} />);
    expect(screen.getByText("申請番号").tagName).toBe("DT");
    expect(screen.getByText("SYS-2026-0001").tagName).toBe("DD");
  });

  it("空の値は「—」で描き、行を消さない", () => {
    render(
      <DescriptionList
        items={[
          { term: "備考", description: "" },
          { term: "担当", description: null },
        ]}
      />,
    );
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("columns / layout を data 属性に出し、span で列をまたぐ", () => {
    const { container } = render(
      <DescriptionList
        columns={2}
        layout="inline"
        items={[{ term: "備考", description: "長い文", span: 2 }]}
      />,
    );
    const dl = container.querySelector("dl") as HTMLElement;
    expect(dl.getAttribute("data-columns")).toBe("2");
    expect(dl.getAttribute("data-layout")).toBe("inline");
    expect((dl.firstElementChild as HTMLElement).style.gridColumn).toBe("span 2");
  });
});
