function sshTarget(username: string, hostname: string): string {
  return username + "@" + hostname;
}

// VS Code and its forks (Cursor, ...) all use the same vscode-remote/ssh-remote+ scheme,
// swapping only the URI's leading app scheme.
function vscodeStyleRemoteUri(
  scheme: string,
  username: string,
  hostname: string,
  path: string,
): string {
  return scheme + "://vscode-remote/ssh-remote+" + sshTarget(username, hostname) + path;
}

export function vscodeRemoteUri(username: string, hostname: string, path: string): string {
  return vscodeStyleRemoteUri("vscode", username, hostname, path);
}

export function cursorRemoteUri(username: string, hostname: string, path: string): string {
  return vscodeStyleRemoteUri("cursor", username, hostname, path);
}

// Zed's zed:// scheme is the same across the Stable, Preview, and Nightly release
// channels (ZED_URL_SCHEME is a fixed "zed" constant); whichever build is registered
// as the OS handler for it is the one that opens.
export function zedRemoteUri(username: string, hostname: string, path: string): string {
  return "zed://ssh/" + sshTarget(username, hostname) + path;
}
