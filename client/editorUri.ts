export interface SshTarget {
  username: string;
  hostname: string;
  port: number;
}

function sshAuthority(target: SshTarget): string {
  return target.username + "@" + target.hostname;
}

function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

// VS Code and its forks (Cursor, ...) all use the same vscode-remote/ssh-remote+ scheme,
// swapping only the URI's leading app scheme. The ssh-remote authority carries no port,
// so a non-standard port needs an ~/.ssh/config alias entered as the SSH host.
function vscodeStyleRemoteUri(scheme: string, target: SshTarget, path: string): string {
  return scheme + "://vscode-remote/ssh-remote+" + sshAuthority(target) + encodePath(path);
}

export function vscodeRemoteUri(target: SshTarget, path: string): string {
  return vscodeStyleRemoteUri("vscode", target, path);
}

export function cursorRemoteUri(target: SshTarget, path: string): string {
  return vscodeStyleRemoteUri("cursor", target, path);
}

// zed://ssh/[<user>@]<host>[:<port>]/<path>. The default SSH port is omitted.
export function zedRemoteUri(target: SshTarget, path: string): string {
  const port = target.port === 22 ? "" : ":" + target.port;
  return "zed://ssh/" + sshAuthority(target) + port + encodePath(path);
}

// Local fast-path: the daemon runs on the same machine as the client, so skip SSH.
export function vscodeLocalUri(path: string): string {
  return "vscode://file" + encodePath(path);
}

export function cursorLocalUri(path: string): string {
  return "cursor://file" + encodePath(path);
}

// zed://file://<absolute-path>
export function zedLocalUri(path: string): string {
  return "zed://file://" + encodePath(path).replace(/^\/+/, "");
}
