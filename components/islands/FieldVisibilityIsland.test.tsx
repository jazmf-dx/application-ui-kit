import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FieldVisibilityIsland } from "./FieldVisibilityIsland";

function setupForm(html: string) {
  const form = document.createElement("form");
  form.innerHTML = `<span id="mount"></span>${html}`;
  document.body.appendChild(form);
  const mount = form.querySelector<HTMLElement>("#mount") as HTMLElement;
  return { form, mount };
}

const block = (form: HTMLElement, id: string) =>
  form.querySelector<HTMLElement>(`#${id}`) as HTMLElement;

describe("FieldVisibilityIsland", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("select の値に応じて塊を出し分け、評価後に data-visible-when-ready を付ける", () => {
    const { form, mount } = setupForm(`
      <select name="kind"><option value="video" selected>動画</option><option value="text">文書</option></select>
      <div id="video-only" data-visible-when='{"kind": "video"}'>video</div>
      <div id="docs" data-visible-when='{"kind": ["text", "pdf"]}'>docs</div>
    `);
    render(<FieldVisibilityIsland />, { container: mount });

    expect(block(form, "video-only").hidden).toBe(false);
    expect(block(form, "docs").hidden).toBe(true);
    expect(block(form, "docs").dataset.visibleWhenReady).toBe("");

    const select = form.querySelector("select") as HTMLSelectElement;
    select.value = "text";
    fireEvent.change(select);
    expect(block(form, "video-only").hidden).toBe(true);
    expect(block(form, "docs").hidden).toBe(false);
  });

  it("複数キーは AND、{not} は否定", () => {
    const { form, mount } = setupForm(`
      <select name="rule"><option value="view" selected>view</option><option value="quiz">quiz</option></select>
      <select name="kind"><option value="video" selected>video</option><option value="pdf">pdf</option></select>
      <p id="note" data-visible-when='{"rule": "view", "kind": {"not": "video"}}'>note</p>
    `);
    render(<FieldVisibilityIsland />, { container: mount });
    expect(block(form, "note").hidden).toBe(true);

    const kind = form.querySelectorAll("select")[1] as HTMLSelectElement;
    kind.value = "pdf";
    fireEvent.change(kind);
    expect(block(form, "note").hidden).toBe(false);
  });

  it("チェックボックス 1 個は真偽値で判定する", () => {
    const { form, mount } = setupForm(`
      <input type="checkbox" name="notify">
      <div id="target" data-visible-when='{"notify": true}'>target</div>
    `);
    render(<FieldVisibilityIsland />, { container: mount });
    expect(block(form, "target").hidden).toBe(true);
    fireEvent.click(form.querySelector("input") as HTMLInputElement);
    expect(block(form, "target").hidden).toBe(false);
  });

  it("壊れた JSON は隠さず、警告だけ出す", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { form, mount } = setupForm(`
      <input name="kind" value="x">
      <div id="broken" data-visible-when='{kind: video}'>broken</div>
    `);
    render(<FieldVisibilityIsland />, { container: mount });
    expect(block(form, "broken").hidden).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
