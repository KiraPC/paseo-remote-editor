# Remote Editor

Adds an **Editor** pill to the composer track bar. Pick VS Code or Zed and it opens the
agent's workspace directly over SSH in that editor, connected to the machine running the
Paseo daemon.

The pill only appears on desktop (not iOS/Android), since opening a local editor via a
deep link only makes sense from a desktop OS.

## Install

```bash
paseo plugin add alhassanaraouf/paseo-remote-editor
```

## How it works

- VS Code: opens `vscode://vscode-remote/ssh-remote+<user>@<host>/<path>`
- Zed: opens `zed://ssh/<user>@<host>/<path>`

`<user>` and `<host>` come from the daemon machine's own `os.userInfo().username` and
`os.hostname()`; `<path>` is the agent's working directory.

## Limitations

- Requires VS Code's Remote-SSH extension or Zed's SSH remote support to already be set up,
  including a working `ssh <user>@<host>` connection from your machine.
- Uses the daemon's reported hostname, so it needs to resolve from your machine (matches your
  `~/.ssh/config` alias, LAN name, or Tailscale name) — no custom port or SSH alias override yet.
- Not shown on iOS or Android.
