import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TabsIsland } from "./TabsIsland";

function setupHost(html: string) {
  const host = document.createElement("div");
  host.dataset.tabHost = "";
  host.innerHTML = `<div id="mount"></div>${html}`;
  document.body.appendChild(host);
  const mount = host.querySelector<HTMLElement>("#mount") as HTMLElement;
  return { host, mount };
}

describe("TabsIsland", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("パネルの data-tab-label からタブバーを描き、初期タブ以外を hidden にする", () => {
    const { host, mount } = setupHost(`
      <section data-tab-panel="basic" data-tab-label="基本情報">basic</section>
      <section data-tab-panel="materials" data-tab-label="教材" hidden>materials</section>
    `);
    render(<TabsIsland initial="materials" label="コースの設定" />, { container: mount });

    expect(screen.getByRole("tablist", { name: "コースの設定" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "教材" }).getAttribute("aria-selected")).toBe("true");
    expect(host.querySelector<HTMLElement>("[data-tab-panel=basic]")?.hidden).toBe(true);
    expect(host.querySelector<HTMLElement>("[data-tab-panel=materials]")?.hidden).toBe(false);
  });

  it("クリックで切り替わり、host に tabs:change を発火する", () => {
    const { host, mount } = setupHost(`
      <section data-tab-panel="a" data-tab-label="A">a</section>
      <section data-tab-panel="b" data-tab-label="B" hidden>b</section>
    `);
    const onChange = vi.fn();
    host.addEventListener("tabs:change", (event) => onChange((event as CustomEvent).detail.value));
    render(<TabsIsland />, { container: mount });

    fireEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(host.querySelector<HTMLElement>("[data-tab-panel=a]")?.hidden).toBe(true);
    expect(host.querySelector<HTMLElement>("[data-tab-panel=b]")?.hidden).toBe(false);
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("矢印キー・Home・End で移動する", () => {
    const { mount } = setupHost(`
      <section data-tab-panel="a" data-tab-label="A">a</section>
      <section data-tab-panel="b" data-tab-label="B" hidden>b</section>
      <section data-tab-panel="c" data-tab-label="C" hidden>c</section>
    `);
    render(<TabsIsland />, { container: mount });
    const tablist = screen.getByRole("tablist");

    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "B" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(tablist, { key: "End" });
    expect(screen.getByRole("tab", { name: "C" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "A" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(tablist, { key: "Home" });
    expect(screen.getByRole("tab", { name: "A" }).getAttribute("aria-selected")).toBe("true");
  });

  it("data-tab-count-id の件数をラベルに添え、htmx:afterSettle で読み直す", () => {
    const { mount } = setupHost(`
      <span id="material-count">3</span>
      <section data-tab-panel="materials" data-tab-label="教材" data-tab-count-id="material-count">m</section>
    `);
    render(<TabsIsland />, { container: mount });
    expect(screen.getByRole("tab", { name: "教材 (3)" })).toBeTruthy();

    (document.getElementById("material-count") as HTMLElement).textContent = "4";
    act(() => {
      document.body.dispatchEvent(new Event("htmx:afterSettle", { bubbles: true }));
    });
    expect(screen.getByRole("tab", { name: "教材 (4)" })).toBeTruthy();
  });

  it("initial が存在しない値なら先頭を開く", () => {
    const { host, mount } = setupHost(`
      <section data-tab-panel="a" data-tab-label="A">a</section>
      <section data-tab-panel="b" data-tab-label="B" hidden>b</section>
    `);
    render(<TabsIsland initial="nope" />, { container: mount });
    expect(host.querySelector<HTMLElement>("[data-tab-panel=a]")?.hidden).toBe(false);
  });

  it("links はタブの右にリンクとして並ぶ", () => {
    const { mount } = setupHost(`<section data-tab-panel="a" data-tab-label="A">a</section>`);
    render(<TabsIsland links={[{ href: "/history/", label: "送信履歴" }]} />, { container: mount });
    expect(screen.getByRole("link", { name: "送信履歴" }).getAttribute("href")).toBe("/history/");
  });

  it("data-tab-host が無ければ警告して何も描かない", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mount = document.createElement("div");
    document.body.appendChild(mount);
    render(<TabsIsland />, { container: mount });
    expect(warn).toHaveBeenCalled();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    warn.mockRestore();
  });
});
