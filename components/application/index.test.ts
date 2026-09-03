import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as publicApi from "./index";

const applicationDir = join(process.cwd(), "components/application");

/**
 * ファイル名と export 名が一致しないもの。
 *
 * `Toast.tsx` は Component ではなく命令型 API のオブジェクトを公開するため、
 * shadcn/ui や sonner と同じ慣習で小文字の `toast` を export する。
 */
const EXPORT_NAME_OVERRIDES: Record<string, string> = {
  Toast: "toast",
};

/**
 * 実装ファイル名の一覧。
 *
 * PascalCase の `.tsx` だけを拾う。`index.ts` は拡張子が違い、
 * `native-validation.tsx` は小文字始まり、`*.test.tsx` は間にドットが入るため
 * いずれもこの正規表現に当たらない。
 */
function implementationNames(): string[] {
  return readdirSync(applicationDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^[A-Z][A-Za-z0-9]*\.tsx$/.test(entry.name))
    .map((entry) => entry.name.replace(/\.tsx$/, ""))
    .sort();
}

describe("public API", () => {
  const components = implementationNames();

  // 正規表現が実装ファイルの命名と食い違うと、以降の it.each が 0 件になって
  // 「全部 export されている」と誤って通る。件数を先に固定して空振りを検知する。
  it("実装ファイルを検出できている", () => {
    expect(components.length).toBeGreaterThanOrEqual(25);
  });

  it.each(components)("%s が public entry から export されている", (name) => {
    const exportName = EXPORT_NAME_OVERRIDES[name] ?? name;
    expect(publicApi).toHaveProperty(exportName);
    expect((publicApi as Record<string, unknown>)[exportName]).toBeDefined();
  });
});
