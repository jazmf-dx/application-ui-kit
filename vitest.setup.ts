/**
 * React の警告をテスト失敗として扱う。
 *
 * <important>
 * 「非標準の prop が DOM へ漏れている」「制御/非制御が切り替わった」といった不具合は
 * console.error に出るだけで、typecheck も lint も test も素通りする。実際に
 * FormField が注入していた独自 prop `error` が Textarea / Checkbox /
 * SearchInput / ButtonGroup の DOM へ漏れ、毎レンダー警告を出していたのを
 * 長期間見逃していた。ここで落とす。
 *
 * 意図的に警告を出すテストは、そのテスト内で console.error を spy して差し替える。
 * </important>
 */

import { afterEach, beforeEach, expect, vi } from "vitest";

let errorSpy: ReturnType<typeof vi.spyOn>;
const seen: unknown[][] = [];

beforeEach(() => {
  seen.length = 0;
  errorSpy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    seen.push(args);
  });
});

afterEach(() => {
  const captured = [...seen];
  errorSpy.mockRestore();
  if (captured.length > 0) {
    const detail = captured.map((args) => args.map(String).join(" ")).join("\n");
    expect.unreachable(`console.error が呼ばれました（React の警告は不具合です）:\n${detail}`);
  }
});
