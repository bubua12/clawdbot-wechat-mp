export type WechatAccountType = "service" | "subscribe";

export type WechatMpConfig = {
  enabled?: boolean;

  // WeChat Official Account credentials
  appId?: string;
  appSecret?: string;

  // Server configuration (公众号后台「服务器配置」)
  token?: string;
  encodingAESKey?: string;

  // Public account type (does not change API endpoints, but helps docs/assumptions)
  accountType?: WechatAccountType;

  // Plugin HTTP route (Gateway plugin HTTP)
  webhookPath?: string; // default: /wechat-mp/events

  // Defaults
  ownerOpenId?: string; // default recipient when `target` omitted

  // Outbound preference
  outboundMode?: "customerService" | "subscribe"; // default: customerService

  // Safety policy
  allowFrom?: Array<string | number>; // allowlist of openid; supports "*" when open
  dmPolicy?: "pairing" | "open" | "allowlist";
};

export type ResolvedWechatAccount = {
  accountId: string;
  enabled: boolean;
  configured: boolean;
};
