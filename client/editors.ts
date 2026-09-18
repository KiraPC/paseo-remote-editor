import type { CustomEditor } from "../shared/settings";
import {
  cursorLocalUri,
  cursorRemoteUri,
  vscodeLocalUri,
  vscodeRemoteUri,
  zedLocalUri,
  zedRemoteUri,
  type SshTarget,
} from "./editorUri";

export interface Editor {
  id: string;
  label: string;
  buildRemote(target: SshTarget, path: string): string;
  buildLocal(path: string): string;
}

function fillCustomTemplate(template: string, target: SshTarget, path: string): string {
  const filled = template
    .replaceAll("{user}", target.username)
    .replaceAll("{host}", target.hostname)
    .replaceAll("{port}", String(target.port));
  const marker = "{path}";
  const index = filled.indexOf(marker);
  // Encode only the path portion so templates keep their literal URI syntax.
  if (index === -1) return filled;
  const before = filled.slice(0, index);
  const after = filled.slice(index + marker.length);
  return before + encodePath(path) + after;
}

function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export const BUILTIN_EDITORS: readonly Editor[] = [
  { id: "vscode", label: "VS Code", buildRemote: vscodeRemoteUri, buildLocal: vscodeLocalUri },
  { id: "cursor", label: "Cursor", buildRemote: cursorRemoteUri, buildLocal: cursorLocalUri },
  { id: "zed", label: "Zed", buildRemote: zedRemoteUri, buildLocal: zedLocalUri },
];

function toEditor(custom: CustomEditor): Editor {
  const build = (path: string, target?: SshTarget) => {
    const template = target ? custom.uriTemplate : (custom.localUriTemplate ?? custom.uriTemplate);
    if (!target) {
      const marker = "{path}";
      const index = template.indexOf(marker);
      if (index === -1) return template;
      return template.slice(0, index) + encodePath(path) + template.slice(index + marker.length);
    }
    return fillCustomTemplate(template, target, path);
  };
  return {
    id: custom.id,
    label: custom.label,
    buildRemote: (target, path) => build(path, target),
    buildLocal: (path) => build(path),
  };
}

export function allEditors(customEditors: readonly CustomEditor[]): Editor[] {
  return [...BUILTIN_EDITORS, ...customEditors.map(toEditor)];
}

export function resolveSshTarget(
  machine: { username: string; hostname: string },
  overrides: { sshHost: string; sshUser: string; sshPort: number },
): SshTarget {
  return {
    username: overrides.sshUser.trim() || machine.username,
    hostname: overrides.sshHost.trim() || machine.hostname,
    port: overrides.sshPort,
  };
}
