import type { ChannelPlugin, ClawdbotConfig } from "clawdbot/plugin-sdk";
import { DEFAULT_ACCOUNT_ID } from "clawdbot/plugin-sdk";
import type { ResolvedWechatAccount, WechatMpConfig } from "./types.js";
import { wechatOutbound } from "./outbound.js";
import { WechatMpConfigSchema } from "./config-schema.js";

const meta = {
  id: "wechat-mp",
  label: "WeChat MP",
  selectionLabel: "WeChat Official Account (公众号)",
  docsPath: "/channels/wechat-mp",
  docsLabel: "wechat-mp",
  blurb: "WeChat Official Account notifications.",
  order: 75,
} as const;

function resolveWechatCfg(cfg: ClawdbotConfig): WechatMpConfig | undefined {
  return (cfg.channels as any)?.["wechat-mp"] as WechatMpConfig | undefined;
}

function resolveCredentials(cfg: WechatMpConfig | undefined): { appId: string; appSecret: string } | null {
  const appId = cfg?.appId?.trim();
  const appSecret = cfg?.appSecret?.trim();
  if (!appId || !appSecret) return null;
  return { appId, appSecret };
}

export const wechatMpPlugin: ChannelPlugin<ResolvedWechatAccount> = {
  id: "wechat-mp",
  meta,
  capabilities: {
    chatTypes: ["direct"],
    polls: false,
    threads: false,
    media: false,
    reactions: false,
    edit: false,
    reply: false,
  },
  reload: { configPrefixes: ["channels.wechat-mp"] },
  configSchema: {
    // zod schema drives runtime; typebox schema drives UI validation
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        enabled: { type: "boolean" },
        appId: { type: "string" },
        appSecret: { type: "string" },
        token: { type: "string" },
        encodingAESKey: { type: "string" },
        accountType: { type: "string", enum: ["service", "subscribe"] },
        webhookPath: { type: "string" },
        ownerOpenId: { type: "string" },
        outboundMode: { type: "string", enum: ["customerService", "subscribe"] },
        dmPolicy: { type: "string", enum: ["pairing", "open", "allowlist"] },
        allowFrom: { type: "array", items: { oneOf: [{ type: "string" }, { type: "number" }] } },
      },
    },
  },
  config: {
    listAccountIds: () => [DEFAULT_ACCOUNT_ID],
    resolveAccount: (cfg) => {
      const wechatCfg = resolveWechatCfg(cfg) ?? {};
      const enabled = Boolean(wechatCfg.enabled);
      const configured = Boolean(resolveCredentials(wechatCfg));
      return { accountId: DEFAULT_ACCOUNT_ID, enabled, configured };
    },
    defaultAccountId: () => DEFAULT_ACCOUNT_ID,
    setAccountEnabled: ({ cfg, enabled }) => ({
      ...cfg,
      channels: {
        ...cfg.channels,
        "wechat-mp": {
          ...(cfg.channels as any)?.["wechat-mp"],
          enabled,
        },
      },
    }),
    deleteAccount: ({ cfg }) => {
      const next = { ...cfg } as ClawdbotConfig;
      const nextChannels = { ...cfg.channels } as any;
      delete nextChannels["wechat-mp"];
      if (Object.keys(nextChannels).length > 0) next.channels = nextChannels;
      else delete (next as any).channels;
      return next;
    },
    isConfigured: (_account, cfg) => Boolean(resolveCredentials(resolveWechatCfg(cfg))),
    describeAccount: (account) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: account.configured,
    }),
    resolveAllowFrom: ({ cfg }) => resolveWechatCfg(cfg)?.allowFrom ?? [],
    formatAllowFrom: ({ allowFrom }) =>
      allowFrom
        .map((e) => String(e).trim())
        .filter(Boolean)
        .map((e) => e.toLowerCase()),
  },
  gateway: {
    startAccount: async (ctx) => {
      // Validate cfg with zod (best-effort; logs only)
      try {
        WechatMpConfigSchema.parse(resolveWechatCfg(ctx.cfg) ?? {});
      } catch (e) {
        ctx.log?.warn?.(`wechat-mp: config validation failed: ${String(e)}`);
      }

      const { monitorWechatProvider } = await import("./monitor.js");
      ctx.log?.info?.("starting wechat-mp provider (webhook)");
      return monitorWechatProvider({
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal,
        accountId: ctx.accountId,
      });
    },
  },
  outbound: wechatOutbound,
};
