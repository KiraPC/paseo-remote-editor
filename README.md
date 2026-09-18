# Remote Editor

Adds an **Editor** pill to the composer track bar. It opens the agent's workspace
directly in VS Code, Cursor, or Zed — over SSH when the Paseo daemon runs on another
machine, or as a local folder when it runs on yours.

The pill only appears on desktop (not iOS/Android), since opening a local editor via a
deep link only makes sense from a desktop OS.

## Install

```bash
paseo plugin add alhassanaraouf/paseo-remote-editor
```

## Settings (Remote Editor)

- **Open in** — default editor (VS Code, Cursor, Zed, or a custom editor).
- **SSH host / user** — blank falls back to what the daemon reports
  (`os.hostname()` / `os.userInfo().username`). Set these when the daemon's hostname
  doesn't resolve locally: a Tailscale name, LAN name, or an `~/.ssh/config` alias.
- **SSH port** — appended as `:port` in Zed and custom URIs. VS Code-style URIs carry
  no port, so a non-standard port there needs an `~/.ssh/config` alias entered as the
  SSH host instead.
- **Open local paths directly** — enable when the daemon runs on this machine, so the
  editor opens the folder (`vscode://file/...`, `zed://file://...`) instead of SSH.
- **Custom editors** — add your own via URI templates using `{user}`, `{host}`,
  `{port}`, and `{path}`.

## How it works

- VS Code / Cursor: `vscode://vscode-remote/ssh-remote+<user>@<host>/<path>`
  (or `vscode://file/<path>` in local mode)
- Zed: `zed://ssh/<user>@<host>[:<port>]/<path>`
  (or `zed://file://<path>` in local mode)

`<path>` is the agent's working directory, percent-encoded per segment so spaces and
special characters survive the deep link.

## Limitations

- Requires the editor's remote/SSH support to already be set up, including a working
  `ssh <user>@<host>` connection from your machine.
- Not shown on iOS or Android.
