import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  cursorLocalUri,
  cursorRemoteUri,
  vscodeLocalUri,
  vscodeRemoteUri,
  zedLocalUri,
  zedRemoteUri,
} from "../client/editorUri";
import { allEditors, resolveSshTarget } from "../client/editors";

const target = { username: "ada", hostname: "daemon.tailnet", port: 22 };

describe("vscode-style remote URIs", () => {
  it("builds a vscode ssh-remote URI", () => {
    assert.equal(
      vscodeRemoteUri(target, "/home/ada/work"),
      "vscode://vscode-remote/ssh-remote+ada@daemon.tailnet/home/ada/work",
    );
  });

  it("builds a cursor ssh-remote URI", () => {
    assert.equal(
      cursorRemoteUri(target, "/home/ada/work"),
      "cursor://vscode-remote/ssh-remote+ada@daemon.tailnet/home/ada/work",
    );
  });

  it("percent-encodes path segments", () => {
    assert.equal(
      vscodeRemoteUri(target, "/home/ada/my work"),
      "vscode://vscode-remote/ssh-remote+ada@daemon.tailnet/home/ada/my%20work",
    );
  });
});

describe("zed remote URIs", () => {
  it("omits the default SSH port", () => {
    assert.equal(
      zedRemoteUri(target, "/home/ada/work"),
      "zed://ssh/ada@daemon.tailnet/home/ada/work",
    );
  });

  it("includes a non-standard port", () => {
    assert.equal(
      zedRemoteUri({ ...target, port: 2222 }, "/home/ada/work"),
      "zed://ssh/ada@daemon.tailnet:2222/home/ada/work",
    );
  });
});

describe("local URIs", () => {
  it("builds local URIs without SSH", () => {
    assert.equal(vscodeLocalUri("/home/ada/work"), "vscode://file/home/ada/work");
    assert.equal(cursorLocalUri("/home/ada/work"), "cursor://file/home/ada/work");
    assert.equal(zedLocalUri("/home/ada/work"), "zed://file://home/ada/work");
  });
});

describe("resolveSshTarget", () => {
  it("prefers overrides over daemon-reported values", () => {
    assert.deepEqual(
      resolveSshTarget(
        { username: "daemon-user", hostname: "daemon-host" },
        { sshHost: "alias", sshUser: "me", sshPort: 2222 },
      ),
      { username: "me", hostname: "alias", port: 2222 },
    );
  });

  it("falls back to daemon values when overrides are blank", () => {
    assert.deepEqual(
      resolveSshTarget(
        { username: "daemon-user", hostname: "daemon-host" },
        { sshHost: "  ", sshUser: "", sshPort: 22 },
      ),
      { username: "daemon-user", hostname: "daemon-host", port: 22 },
    );
  });
});

describe("custom editors", () => {
  it("fills URI templates with the SSH target and path", () => {
    const [custom] = allEditors([
      { id: "mine", label: "Mine", uriTemplate: "mine://{user}@{host}:{port}{path}" },
    ]).filter((e) => e.id === "mine");
    assert.equal(
      custom.buildRemote(target, "/home/ada/my work"),
      "mine://ada@daemon.tailnet:22/home/ada/my%20work",
    );
  });

  it("falls back to uriTemplate for local paths", () => {
    const [custom] = allEditors([
      { id: "mine", label: "Mine", uriTemplate: "mine://open?path={path}" },
    ]).filter((e) => e.id === "mine");
    assert.equal(custom.buildLocal("/home/ada/work"), "mine://open?path=/home/ada/work");
  });
});
