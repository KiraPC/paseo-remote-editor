import { defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

export const customEditorSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  // {user}, {host}, {port}, and {path} are substituted with the SSH connection.
  uriTemplate: z.string().min(1),
  // {path} is substituted with the workspace path. Falls back to uriTemplate.
  localUriTemplate: z.string().min(1).optional(),
});
export type CustomEditor = z.infer<typeof customEditorSchema>;

export const editorPreferences = defineSettings({
  id: "editors",
  scope: "host",
  version: 2,
  schema: z.object({
    defaultEditorId: z.string().default("vscode"),
    customEditors: z.array(customEditorSchema).default([]),
    // Blank means "use what the daemon reports". Set these when the daemon's
    // hostname doesn't resolve locally (Tailscale name, ~/.ssh/config alias).
    sshHost: z.string().default(""),
    sshUser: z.string().default(""),
    // Only Zed and custom templates encode the port in the URI. VS Code-style
    // URIs carry no port, so a non-standard port there needs an ~/.ssh/config
    // alias entered as the SSH host above.
    sshPort: z.number().int().min(1).max(65535).default(22),
    // When the daemon runs on the same machine as the client, skip SSH and
    // open the local path directly.
    preferLocal: z.boolean().default(false),
  }),
  migrate: (values, fromVersion) => {
    if (fromVersion < 2 && values && typeof values === "object") {
      return { sshHost: "", sshUser: "", sshPort: 22, preferLocal: false, ...values };
    }
    return values;
  },
});
