import type { PluginClientContext } from "@getpaseo/plugin/client";
import { Platform } from "react-native";
import { EditorPillContent } from "./client/EditorPillContent";
import { EditorSettingsScreen } from "./client/EditorSettingsScreen";

export default function contribute(client: PluginClientContext) {
  const removeSettingsScreen = client.addSettingsScreen({
    id: "editors",
    title: "Remote Editor",
    icon: "Code",
    Component: EditorSettingsScreen,
  });

  // Deep-linking into a local editor only makes sense from a desktop OS, never mobile.
  if (Platform.OS === "ios" || Platform.OS === "android") return removeSettingsScreen;

  const pills = new Map<string, () => void>();

  const unsubscribe = client.paseo.agents.subscribe((update) => {
    if (update.kind === "remove") {
      pills.get(update.agentId)?.();
      pills.delete(update.agentId);
      return;
    }
    if (update.kind !== "upsert" || !update.agent.workspaceId) return;
    const { id: agentId, workspaceId } = update.agent;
    if (pills.has(agentId)) return;
    const pill = client.addComposerPill({
      id: "open-in-editor",
      workspaceId,
      agentId,
      button: {
        title: "Open in editor",
        icon: "Code",
        label: "Editor",
        behavior: { kind: "popover", Content: EditorPillContent },
      },
    });
    pills.set(agentId, () => pill.remove());
  });

  return () => {
    removeSettingsScreen();
    unsubscribe();
    for (const remove of pills.values()) remove();
  };
}
