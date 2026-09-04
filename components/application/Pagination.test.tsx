import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("totalPages が 1 以下で件数も無ければ何も描かない（従来互換）", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.innerHTML).toBe("");
  });

  it("totalCount / pageSize から総ページ数を求め、件数表記を描く", () => {
    render(<Pagination page={2} totalCount={238} pageSize={20} onPageChange={() => {}} />);
    expect(screen.getByText("238 件中 21–40 件")).toBeTruthy();
    expect(screen.getByRole("button", { name: "12 ページ目" })).toBeTruthy();
  });

  it("件数があれば 1 ページでも件数表記を描く（ナビは描かない）", () => {
    render(<Pagination page={1} totalCount={7} pageSize={20} onPageChange={() => {}} />);
    expect(screen.getByText("7 件中 1–7 件")).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("0 件は「0 件」", () => {
    render(<Pagination page={1} totalCount={0} pageSize={20} onPageChange={() => {}} />);
    expect(screen.getByText("0 件")).toBeTruthy();
  });

  it("表示件数の切替で onPageSizeChange を呼ぶ", () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalCount={100}
        pageSize={20}
        pageSizeOptions={[20, 50, 100]}
        onPageChange={() => {}}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "表示件数" }), {
      target: { value: "50" },
    });
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("formatSummary で表記を差し替えられる", () => {
    render(
      <Pagination
        page={1}
        totalCount={30}
        pageSize={10}
        onPageChange={() => {}}
        formatSummary={(from, to, total) => `${from}-${to} of ${total}`}
      />,
    );
    expect(screen.getByText("1-10 of 30")).toBeTruthy();
  });

  it("totalPages も totalCount も無ければ警告して何も描かない", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Pagination page={1} onPageChange={() => {}} />);
    expect(container.innerHTML).toBe("");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("前後のボタンで onPageChange を呼ぶ", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "前のページ" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
