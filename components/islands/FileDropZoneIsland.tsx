/**
 * FileDropZoneIsland - Django Form の `<input type="file">` にドロップ枠を付ける
 *
 * Django が描いた input はそのまま残し（name・required・サーバー側検証はそのまま）、
 * この Island が見せ方（ドロップ枠・選択済み一覧・事前チェック）だけを担う。
 * 選んだファイルは `DataTransfer` で元の input に書き戻すので、通常のフォーム送信で届く。
 *
 * ```html
 * {{ form.attachment }}   {# <input type="file" id="id_attachment" name="attachment" accept=".pdf"> #}
 * <div data-react="file-drop-zone"
 *      data-target="id_attachment"
 *      data-max-size="10485760"
 *      data-description="PDF のみ。10MB まで"></div>
 * ```
 *
 * - `accept` / `multiple` は省略時に input の属性から読む。
 * - 自前の hidden input は作らない（name が重複するため）。元の input を `hidden` にする。
 * - `DataTransfer` が無い環境では書き戻さず警告する（表示だけの動作になる）。
 */

import { useEffect, useRef, useState } from "react";
import { FileDropZone } from "../application/FileDropZone";

export interface FileDropZoneIslandProps {
  /** Django が描いた `<input type="file">` の id */
  target: string;
  /** 受け付ける種類。省略時は input の accept */
  accept?: string;
  /** 複数選択。省略時は input の multiple */
  multiple?: boolean;
  /** 1 ファイルの上限（バイト） */
  maxSize?: number;
  /** ファイル数の上限 */
  maxFiles?: number;
  /** 枠内の見出し */
  label?: string;
  /** 枠内の補足 */
  description?: string;
  /** 選択ボタンの文言 */
  browseLabel?: string;
}

function writeBack(input: HTMLInputElement, files: File[]): void {
  if (typeof DataTransfer === "undefined") {
    console.warn("[FileDropZoneIsland] DataTransfer が無いため input に書き戻せません");
    return;
  }
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
}

export function FileDropZoneIsland({
  target,
  accept,
  multiple,
  maxSize,
  maxFiles,
  label,
  description,
  browseLabel,
}: FileDropZoneIslandProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const writingRef = useRef(false);
  const [files, setFiles] = useState<File[]>([]);
  const [inputAccept, setInputAccept] = useState<string | undefined>(accept);
  const [inputMultiple, setInputMultiple] = useState<boolean>(Boolean(multiple));
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const input = document.getElementById(target);
    if (!(input instanceof HTMLInputElement) || input.type !== "file") {
      console.warn(`[FileDropZoneIsland] #${target} が <input type="file"> ではありません`);
      return;
    }
    inputRef.current = input;
    input.hidden = true;
    setInputAccept(accept ?? input.accept ?? undefined);
    setInputMultiple(multiple ?? input.multiple);
    setDisabled(input.disabled);
    setFiles(Array.from(input.files ?? []));

    // ユーザーがラベル経由で直接選んだ場合も表示を同期する
    const onChange = () => {
      if (writingRef.current) return;
      setFiles(Array.from(input.files ?? []));
    };
    input.addEventListener("change", onChange);
    return () => {
      input.removeEventListener("change", onChange);
      input.hidden = false;
    };
  }, [target, accept, multiple]);

  const handleFilesChange = (next: File[]) => {
    setFiles(next);
    const input = inputRef.current;
    if (!input) return;
    writingRef.current = true;
    try {
      writeBack(input, next);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    } finally {
      writingRef.current = false;
    }
  };

  return (
    <FileDropZone
      files={files}
      onFilesChange={handleFilesChange}
      onBrowse={() => inputRef.current?.click()}
      accept={inputAccept || undefined}
      multiple={inputMultiple}
      maxSize={maxSize}
      maxFiles={maxFiles}
      disabled={disabled}
      label={label}
      description={description}
      browseLabel={browseLabel}
    />
  );
}
