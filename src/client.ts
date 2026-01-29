import type { WechatMpConfig } from "./types.js";

type TokenState = {
  accessToken: string;
  expiresAt: number; // ms epoch
};

let tokenState: TokenState | null = null;

export async function getAccessToken(cfg: WechatMpConfig): Promise<string> {
  const appId = cfg.appId?.trim();
  const appSecret = cfg.appSecret?.trim();
  if (!appId || !appSecret) {
    throw new Error("WeChat MP credentials missing: channels.wechat-mp.appId/appSecret required");
  }

  const now = Date.now();
  if (tokenState && tokenState.expiresAt - now > 60_000) {
    return tokenState.accessToken;
  }

  const url = new URL("https://api.weixin.qq.com/cgi-bin/token");
  url.searchParams.set("grant_type", "client_credential");
  url.searchParams.set("appid", appId);
  url.searchParams.set("secret", appSecret);

  const res = await fetch(url.toString(), { method: "GET" });
  const data = (await res.json()) as any;
  if (!res.ok || !data?.access_token) {
    throw new Error(`WeChat token error: ${res.status} ${JSON.stringify(data)}`);
  }

  const expiresInSec = Number(data.expires_in ?? 7200);
  tokenState = {
    accessToken: String(data.access_token),
    expiresAt: now + expiresInSec * 1000,
  };
  return tokenState.accessToken;
}

export async function sendCustomerServiceText(cfg: WechatMpConfig, toOpenId: string, text: string) {
  const token = await getAccessToken(cfg);
  const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${encodeURIComponent(token)}`;

  const payload = {
    touser: toOpenId,
    msgtype: "text",
    text: { content: text },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as any;
  if (!res.ok || data?.errcode) {
    throw new Error(`WeChat send error: ${res.status} ${JSON.stringify(data)}`);
  }

  return { ok: true as const };
}
