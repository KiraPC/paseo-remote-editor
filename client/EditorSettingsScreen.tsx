import type { PluginSurfaceProps } from "@getpaseo/plugin/client";
import { useSettings } from "@getpaseo/plugin/client";
import {
  SettingsAction,
  SettingsCard,
  SettingsInput,
  SettingsRow,
  SettingsSection,
  SettingsSelect,
} from "@getpaseo/plugin/client/ui";
import { useState } from "react";
import { Text } from "react-native";
import { editorPreferences } from "../shared/settings";
import { allEditors } from "./editors";

export function EditorSettingsScreen({ theme }: PluginSurfaceProps) {
  const settings = useSettings(editorPreferences);
  const [draftId, setDraftId] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftTemplate, setDraftTemplate] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (settings.status !== "ready") {
    return (
      <Text style={{ color: theme.colors.foregroundMuted }}>
        {settings.status === "loading" ? "Loading…" : "Could not read settings."}
      </Text>
    );
  }

  const { values, revision, save } = settings;
  const editors = allEditors(values.customEditors);

  async function addCustomEditor() {
    setError(null);
    const id = draftId.trim();
    const label = draftLabel.trim();
    const uriTemplate = draftTemplate.trim();
    if (!id || !label || !uriTemplate) {
      setError("Fill in id, label, and URI template.");
      return;
    }
    if (editors.some((editor) => editor.id === id)) {
      setError("An editor with this id already exists.");
      return;
    }
    const ok = await save(
      { ...values, customEditors: [...values.customEditors, { id, label, uriTemplate }] },
      revision,
    );
    if (ok) {
      setDraftId("");
      setDraftLabel("");
      setDraftTemplate("");
    } else {
      setError("Could not save. Try again.");
    }
  }

  async function removeCustomEditor(id: string) {
    const customEditors = values.customEditors.filter((editor) => editor.id !== id);
    const defaultEditorId = values.defaultEditorId === id ? "vscode" : values.defaultEditorId;
    await save({ ...values, customEditors, defaultEditorId }, revision);
  }

  return (
    <>
      <SettingsSection title="Default editor">
        <SettingsCard>
          <SettingsSelect
            label="Open in"
            value={values.defaultEditorId}
            options={editors.map((editor) => ({ label: editor.label, value: editor.id }))}
            onValueChange={(defaultEditorId) => save({ ...values, defaultEditorId }, revision)}
          />
        </SettingsCard>
      </SettingsSection>
      <SettingsSection title="Custom editors" info="Use {user}, {host}, and {path} in the URI template.">
        <SettingsCard>
          {values.customEditors.map((editor) => (
            <SettingsRow key={editor.id} label={editor.label} hint={editor.uriTemplate}>
              <SettingsAction label={editor.label} actionLabel="Remove" onPress={() => removeCustomEditor(editor.id)} />
            </SettingsRow>
          ))}
          <SettingsInput label="Id" placeholder="cursor" onChangeText={setDraftId} />
          <SettingsInput label="Label" placeholder="Cursor" onChangeText={setDraftLabel} />
          <SettingsInput
            label="URI template"
            hint="Use {user}, {host}, and {path}, e.g. cursor://ssh/{user}@{host}{path}"
            placeholder="cursor://ssh/{user}@{host}{path}"
            onChangeText={setDraftTemplate}
          />
          <SettingsAction
            label="Add editor"
            actionLabel="Add"
            error={error ?? undefined}
            onPress={addCustomEditor}
          />
        </SettingsCard>
      </SettingsSection>
    </>
  );
}
