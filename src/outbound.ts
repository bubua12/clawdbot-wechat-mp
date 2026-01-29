import type { ChannelOutboundAdapter } from "clawdbot/plugin-sdk";
import type { WechatMpConfig } from "./types.js";
import { sendCustomerServiceText } from "./client.js";

function resolveWechatCfg(cfg: any): WechatMpConfig {
  return (cfg?.channels as any)?.["wechat-mp"] ?? {};
}

export const wechatOutbound: ChannelOutboundAdapter = {
  deliveryMode: "direct",
  chunkerMode: "text",
  textChunkLimit: 1800,
  sendText: async ({ cfg, to, text }) => {
    const wechatCfg = resolveWechatCfg(cfg);
    const target = String(to ?? "").trim() || String(wechatCfg.ownerOpenId ?? "").trim();
    if (!target) {
      throw new Error(
        'wechat-mp: missing target. Provide message.target (openid) or set channels.wechat-mp.ownerOpenId.'
      );
    }

    // MVP: customer service message only
    await sendCustomerServiceText(wechatCfg, target, text);

    return { channel: "wechat-mp", ok: true, id: null };
  },
};
