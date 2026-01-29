import type { PluginRuntime } from "clawdbot/plugin-sdk";

let runtime: PluginRuntime | null = null;

export function setWechatRuntime(next: PluginRuntime) {
  runtime = next;
}

export function getWechatRuntime(): PluginRuntime {
  if (!runtime) throw new Error("WeChat MP runtime not initialized");
  return runtime;
}
