import type { ClawdbotPluginApi } from "clawdbot/plugin-sdk";
import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";

import { wechatMpPlugin } from "./src/channel.js";
import { setWechatRuntime } from "./src/runtime.js";

const plugin = {
  id: "wechat-mp",
  name: "WeChat MP",
  description: "WeChat Official Account (公众号) channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: ClawdbotPluginApi) {
    setWechatRuntime(api.runtime);
    api.registerChannel({ plugin: wechatMpPlugin });
  },
};

export default plugin;
