import type { PluginClientContext } from "@getpaseo/plugin/client";
import { Platform } from "react-native";
import { EditorPillContent } from "./client/EditorPillContent";
import { EditorSettingsScreen } from "./client/EditorSettingsScreen";

interface AgentRef {
  readonly id: string;
  readonly workspaceId?: string | null;
}
interface OwnedSubscription {
  release(): Promise<void>;
}

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
  let disposed = false;
  let unsubscribeObserver: (() => void) | null = null;
  let subscription: OwnedSubscription | null = null;

  const ensurePill = (agentId: string, workspaceId: string): void => {
    if (pills.has(agentId)) return;
    const registration = client.addComposerPill({
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
    pills.set(agentId, () => registration.remove());
  };

  const removePill = (agentId: string): void => {
    const remove = pills.get(agentId);
    if (!remove) return;
    pills.delete(agentId);
    remove();
  };

  const reconcile = (agents: readonly AgentRef[]): void => {
    const present = new Set<string>();
    for (const agent of agents) {
      if (!agent.workspaceId) continue;
      present.add(agent.id);
      ensurePill(agent.id, agent.workspaceId);
    }
    for (const agentId of [...pills.keys()]) {
      if (!present.has(agentId)) removePill(agentId);
    }
  };

  const unsubscribeListener = client.paseo.agents.subscribe((update) => {
    if (disposed) return;
    if (update.kind === "remove") {
      removePill(update.agentId);
      return;
    }
    if (!update.agent.workspaceId) return;
    ensurePill(update.agent.id, update.agent.workspaceId);
  });

  void client.paseo.agents
    .list({ subscribe: {} })
    .then((result) => {
      if (disposed) {
        void result.subscription?.release();
        return;
      }
      reconcile(result.entries.map((entry) => entry.agent));
      const owned = result.subscription;
      if (owned) {
        subscription = owned;
        unsubscribeObserver = owned.subscribe({
          snapshot: (snapshot) => {
            if (disposed) return;
            reconcile(snapshot.entries.map((entry) => entry.agent));
          },
          update: () => {},
        });
      }
    })
    .catch((error: unknown) => {
      console.warn("[remote-editor] failed to subscribe to agent directory:", error);
    });

  return () => {
    disposed = true;
    unsubscribeListener();
    unsubscribeObserver?.();
    unsubscribeObserver = null;
    void subscription?.release();
    subscription = null;
    for (const remove of pills.values()) remove();
    pills.clear();
    removeSettingsScreen();
  };
}
