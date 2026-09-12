import * as os from "node:os";

export function getMachineInfo() {
  return { hostname: os.hostname(), username: os.userInfo().username };
}
