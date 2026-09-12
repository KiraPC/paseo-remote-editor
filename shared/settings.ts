import { defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

export const customEditorSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  // {user}, {host}, and {path} are substituted with the daemon machine's SSH identity.
  uriTemplate: z.string().min(1),
});
export type CustomEditor = z.infer<typeof customEditorSchema>;

export const editorPreferences = defineSettings({
  id: "editors",
  scope: "host",
  version: 1,
  schema: z.object({
    defaultEditorId: z.string().default("vscode"),
    customEditors: z.array(customEditorSchema).default([]),
  }),
});
