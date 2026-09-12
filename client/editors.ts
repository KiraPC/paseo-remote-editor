import type { CustomEditor } from "../shared/settings";
import { cursorRemoteUri, vscodeRemoteUri, zedRemoteUri } from "./editorUri";

export interface Editor {
  id: string;
  label: string;
  build(username: string, hostname: string, path: string): string;
}

export const BUILTIN_EDITORS: readonly Editor[] = [
  { id: "vscode", label: "VS Code", build: vscodeRemoteUri },
  { id: "cursor", label: "Cursor", build: cursorRemoteUri },
  { id: "zed", label: "Zed", build: zedRemoteUri },
];

function toEditor(custom: CustomEditor): Editor {
  return {
    id: custom.id,
    label: custom.label,
    build: (username, hostname, path) =>
      custom.uriTemplate
        .replaceAll("{user}", username)
        .replaceAll("{host}", hostname)
        .replaceAll("{path}", path),
  };
}

export function allEditors(customEditors: readonly CustomEditor[]): Editor[] {
  return [...BUILTIN_EDITORS, ...customEditors.map(toEditor)];
}
