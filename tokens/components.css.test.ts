import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Base UI の Checkbox.Root / RadioGroupItem は <button> ではなく
 * <span role="..."> を描画する。display を明示しない cn-* クラスは
 * inline のままになり、size-* が無視されて border だけの線に潰れる
 * （ラベル付きは flex 子として blockify されるため偶然直ってしまい、
 * typecheck / test / build では気づけない）。ここで宣言を固定する。
 */
const css = readFileSync(join(process.cwd(), "tokens/components.css"), "utf-8");
const themeCss = readFileSync(join(process.cwd(), "tokens/theme.css"), "utf-8");

function ruleBody(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `${selector} が見つからない`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("}", start));
}

describe("tokens/theme.css", () => {
  /* Base UI は値なしの `data-selected=""` を書き、react-day-picker は
   * `data-selected="true"` を書く。`="true"` だけを見ていると Base UI の
   * Select / Combobox の選択状態に一切当たらない。 */
  it("data-selected バリアントは値なしの属性にも当たる", () => {
    const start = themeCss.indexOf("@custom-variant data-selected");
    expect(start, "@custom-variant data-selected が見つからない").toBeGreaterThan(-1);
    const body = themeCss.slice(start, themeCss.indexOf("@slot", start));
    expect(body).toMatch(/\[data-selected\]:not\(\[data-selected="false"\]\)/);
  });

  it.each(["--color-disabled", "--color-disabled-foreground", "--color-disabled-border"])(
    "%s が light / dark の両方で定義されている",
    (token) => {
      // @theme（light）と .dark で 1 回ずつ。値の重複定義は分裂の元なのでここで固定する。
      const hits = themeCss.match(new RegExp(`^\\s*${token}:`, "gm")) ?? [];
      expect(hits).toHaveLength(2);
    },
  );
});

describe("tokens/components.css", () => {
  it("cn-checkbox は display を明示する", () => {
    expect(ruleBody(".cn-checkbox")).toMatch(/\b(inline-flex|flex|inline-grid|grid)\b/);
  });

  it("cn-radio-group-item は display を明示する", () => {
    expect(ruleBody(".cn-radio-group-item")).toMatch(/\b(inline-flex|flex|inline-grid|grid)\b/);
  });

  /* 素の `rounded` は @theme の --radius（0.5rem）を引く。16px の箱では
   * 半径 8px = 円になり、チェックボックスがラジオボタンと区別できない。
   * rounded-sm（4px）でも箱の 1/4 が角丸になって丸く見えたため 2px にしてある。 */
  it("cn-checkbox は角丸を rounded-xs で固定する（円に見せない）", () => {
    const body = ruleBody(".cn-checkbox");
    expect(body).toMatch(/\brounded-xs\b/);
    expect(body).not.toMatch(/\brounded(?![-\w])/);
    expect(body).not.toMatch(/\brounded-sm\b/);
    expect(body).not.toMatch(/\brounded-full\b/);
  });

  it("cn-radio-group-item は丸のままにする（チェックボックスと形で区別する）", () => {
    expect(ruleBody(".cn-radio-group-item")).toMatch(/\brounded-full\b/);
  });

  /* 無効は彩度を落として示す。opacity だけで落とすと primary が淡い水色に
   * なり「押せる薄い色のボタン」に読める。 */
  describe("無効状態は無彩色にする", () => {
    it.each([".cn-button", ".cn-checkbox", ".cn-radio-group-item"])(
      "%s は無効時に opacity で色を薄めない",
      (selector) => {
        expect(ruleBody(selector)).not.toMatch(/disabled:opacity-/);
      },
    );

    it("cn-button の無効時は disabled トークンへ差し替える", () => {
      // 面を持つバリアント向けの規則。セレクタが複数行なので前方一致で探す。
      const start = css.indexOf('.cn-button:disabled:not([aria-busy="true"]');
      expect(start, "cn-button の無効スタイルが見つからない").toBeGreaterThan(-1);
      const body = css.slice(start, css.indexOf("}", start));
      expect(body).toMatch(/background-color:\s*var\(--color-disabled\)/);
      expect(body).toMatch(/color:\s*var\(--color-disabled-foreground\)/);
      expect(body).toMatch(/border-color:\s*var\(--color-disabled-border\)/);
    });

    /* loading は「処理中」で「使えない」ではない。アクションの色を保つ。 */
    it("cn-button の無効スタイルは loading（aria-busy）を除外する", () => {
      expect(css).toMatch(/:not\(\[aria-busy="true"\]/);
    });
  });

  /* 選択は左のチェック用の溝ではなく面と文字で示す。未選択のリストでは
   * 溝が最初から最後まで空になり、文字だけが右へずれて見えた。 */
  describe("Select / Combobox の選択状態", () => {
    it.each([".cn-select-item", ".cn-combobox-item"])(
      "%s はチェック用の溝を左に空けない（ラベルの頭を揃える）",
      (selector) => {
        const body = ruleBody(selector);
        expect(body).not.toMatch(/\bpl-8\b/);
        expect(body).toMatch(/\bpl-2\b/);
      },
    );

    it.each([".cn-select-item", ".cn-combobox-item"])("%s は選択を面と文字で示す", (selector) => {
      const body = ruleBody(`${selector}[data-selected]:not([data-selected="false"])`);
      expect(body).toMatch(/var\(--color-primary\)/);
      expect(body).toMatch(/font-weight/);
    });

    /* 行の流れに入れる（ml-auto）と、選択中の行だけ末尾のバッジがチェックの分
     * 左へずれてバッジの列が揃わない。絶対配置のまま右へ回す。 */
    it.each([".cn-select-item-indicator", ".cn-combobox-item-indicator"])(
      "%s は右端に絶対配置する",
      (selector) => {
        const body = ruleBody(selector);
        expect(body).toMatch(/\babsolute\b/);
        expect(body).toMatch(/\bright-2\b/);
        expect(body).not.toMatch(/\bleft-2\b/);
      },
    );
  });
});
