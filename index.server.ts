import type { PluginServerContext } from "@getpaseo/plugin/server";
import { getMachineInfo } from "./server/machine";
import { machineInfoRpc } from "./shared/machine";
import { editorPreferences } from "./shared/settings";

export default function contribute(server: PluginServerContext) {
  server.handle(machineInfoRpc, getMachineInfo);
  server.registerSettings(editorPreferences);
  return () => {};
}
