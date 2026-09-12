import type { PluginButtonContentProps } from "@getpaseo/plugin/client";
import { useAgent, useRpc, useSettings } from "@getpaseo/plugin/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { editorPreferences } from "../shared/settings";
import { machineInfoRpc } from "../shared/machine";
import { allEditors, type Editor } from "./editors";
import { openEditorUri } from "./openEditorUri";

export function EditorPillContent(props: PluginButtonContentProps) {
  const { theme, close } = props;
  const agentId = props.context === "agent" ? props.agentId : undefined;
  const cwd = useAgent(agentId ?? "", (agent) => agent.cwd);
  const getMachineInfo = useRpc(machineInfoRpc);
  const machine = useQuery({ queryKey: ["machine.info"], queryFn: () => getMachineInfo({}) });
  const settings = useSettings(editorPreferences);
  const opened = useRef(false);

  const editors = useMemo(
    () => (settings.status === "ready" ? allEditors(settings.values.customEditors) : []),
    [settings.status === "ready" ? settings.values.customEditors : null],
  );
  const defaultEditor =
    settings.status === "ready"
      ? (editors.find((editor) => editor.id === settings.values.defaultEditorId) ?? editors[0])
      : undefined;

  const styles = useMemo(
    () => ({
      screen: { padding: 12, gap: 8, backgroundColor: theme.colors.surface0 },
      row: { padding: 10, borderRadius: 8, backgroundColor: theme.colors.surface1 },
      rowText: { color: theme.colors.foreground },
      muted: { color: theme.colors.foregroundMuted },
    }),
    [theme],
  );

  const ready = Boolean(cwd && machine.data && defaultEditor);

  async function openIn(editor: Editor) {
    if (!cwd || !machine.data) return;
    await openEditorUri(editor.build(machine.data.username, machine.data.hostname, cwd));
    close();
  }

  // A configured default opens immediately; the picker below only ever shows for the
  // rare case where no default editor could be resolved (e.g. an empty catalog).
  useEffect(() => {
    if (opened.current || !ready || !defaultEditor) return;
    opened.current = true;
    void openIn(defaultEditor);
  }, [ready, defaultEditor]);

  if (!ready) {
    return (
      <View style={styles.screen}>
        <Text style={styles.muted}>
          {machine.isError ? "Could not read this machine's SSH address." : "Opening…"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {editors.map((editor) => (
        <Pressable
          key={editor.id}
          accessibilityRole="button"
          accessibilityLabel={"Open in " + editor.label}
          style={styles.row}
          onPress={() => openIn(editor)}
        >
          <Text style={styles.rowText}>{editor.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
