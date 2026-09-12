import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const machineInfoRpc = defineRpc({
  name: "machine.info",
  input: z.object({}),
  output: z.object({ hostname: z.string(), username: z.string() }),
});
