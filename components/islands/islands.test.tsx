import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getCsrfHeaders, getCsrfToken } from "../../lib/csrf";
import { toast } from "../application/Toast";
import { DatePickerIsland } from "./DatePickerIsland";
import { ToastListenerIsland } from "./ToastListenerIsland";
import { parseProps } from "./parse-props";
import {
  getIslandComponent,
  getRegisteredIslandComponents,
  registerIslandComponents,
} from "./registry";

describe("getCsrfToken", () => {
  afterEach(() => {
    // happy-dom では expire 指定なしの上書きで消す
    document.cookie = "csrftoken=";
    document.cookie = "custom_csrftoken=";
  });

  it("reads the Django default cookie name", () => {
    document.cookie = "csrftoken=abc123";
    expect(getCsrfToken()).toBe("abc123");
  });

  it("reads a project-specific cookie name", () => {
    document.cookie = "custom_csrftoken=xyz789";
    expect(getCsrfToken("custom_csrftoken")).toBe("xyz789");
  });

  it("returns an empty string when the cookie is missing", () => {
    expect(getCsrfToken("no_such_cookie")).toBe("");
  });

  it("builds the X-CSRFToken header only when a token exists", () => {
    expect(getCsrfHeaders("no_such_cookie")).toEqual({});
    document.cookie = "csrftoken=abc123";
    expect(getCsrfHeaders()).toEqual({ "X-CSRFToken": "abc123" });
  });
});

describe("parseProps", () => {
  it("parses individual data-* attributes with JSON coercion", () => {
    const el = document.createElement("div");
    el.dataset.react = "confirm-dialog";
    el.dataset.title = "削除しますか？";
    el.dataset.reloadOnSuccess = "true";
    expect(parseProps(el)).toEqual({
      title: "削除しますか？",
      reloadOnSuccess: true,
    });
  });

  it("lets data-props (JSON) win over individual attributes", () => {
    const el = document.createElement("div");
    el.dataset.react = "confirm-dialog";
    el.dataset.title = "individual";
    el.dataset.props = '{"title": "from-json", "type": "danger"}';
    expect(parseProps(el)).toEqual({ title: "from-json", type: "danger" });
  });

  it("excludes data-react / data-props / data-react-mounted themselves", () => {
    const el = document.createElement("div");
    el.dataset.react = "toast-listener";
    el.dataset.reactMounted = "true";
    expect(parseProps(el)).toEqual({});
  });
});

describe("island registry", () => {
  it("registers and resolves components by data-react name", () => {
    const Dummy = () => null;
    registerIslandComponents({ "test-dummy": Dummy });
    expect(getIslandComponent("test-dummy")).toBe(Dummy);
    expect(getRegisteredIslandComponents()).toContain("test-dummy");
    expect(getIslandComponent("unknown")).toBeNull();
  });
});

describe("DatePickerIsland", () => {
  it("writes the initial single value into the target hidden input", () => {
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = "id_start_date";
    document.body.appendChild(hidden);

    render(<DatePickerIsland mode="single" target="id_start_date" value="2026-08-24" />);

    expect(hidden.value).toBe("2026-08-24");
    hidden.remove();
  });

  it("writes range values into both hidden inputs", () => {
    const from = document.createElement("input");
    from.type = "hidden";
    from.id = "id_date_from";
    const to = document.createElement("input");
    to.type = "hidden";
    to.id = "id_date_to";
    document.body.append(from, to);

    render(
      <DatePickerIsland
        mode="range"
        targetFrom="id_date_from"
        targetTo="id_date_to"
        valueFrom="2026-08-01"
        valueTo="2026-08-31"
      />,
    );

    expect(from.value).toBe("2026-08-01");
    expect(to.value).toBe("2026-08-31");
    from.remove();
    to.remove();
  });
});

describe("ToastListenerIsland", () => {
  afterEach(() => {
    window.ApplicationToast = undefined;
  });

  /* グローバルの名前は Django テンプレート / 素の JS との実行時契約で、
   * package の export 名（`toast`）とは別に固定されている。型でも
   * コンパイラでも守られないため、名前と形をここで押さえる。 */
  it("registers the imperative API as window.ApplicationToast", () => {
    render(<ToastListenerIsland />);

    expect(window.ApplicationToast).toBe(toast);
    for (const method of ["success", "error", "warning", "info", "show"] as const) {
      expect(typeof window.ApplicationToast?.[method]).toBe("function");
    }
  });
});
