import type { ClawdbotConfig, RuntimeEnv } from "clawdbot/plugin-sdk";
import { registerPluginHttpRoute, normalizePluginHttpPath } from "clawdbot/plugin-sdk";
import type { WechatMpConfig } from "./types.js";
import { verifyWeChatSignature } from "./wechat-signature.js";
import { parseXml } from "./xml.js";

export type MonitorWechatOpts = {
  config?: ClawdbotConfig;
  runtime?: RuntimeEnv;
  abortSignal?: AbortSignal;
  accountId?: string;
};

async function readBody(req: any): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export async function monitorWechatProvider(opts: MonitorWechatOpts = {}): Promise<void> {
  const cfg = opts.config;
  if (!cfg) throw new Error("Config is required for WeChat MP monitor");

  const wechatCfg = (cfg.channels as any)?.["wechat-mp"] as WechatMpConfig | undefined;
  const runtime = opts.runtime;
  const log = runtime?.log ?? console.log;
  const error = runtime?.error ?? console.error;

  const webhookPath = normalizePluginHttpPath(wechatCfg?.webhookPath ?? "/wechat-mp/events");
  const token = wechatCfg?.token ?? "";

  if (!token) {
    log("wechat-mp: warning: channels.wechat-mp.token not set; webhook signature verification will fail");
  }

  const unregister = registerPluginHttpRoute({
    pluginId: "wechat-mp",
    path: webhookPath,
    handler: async (req: any, res: any) => {
      const url = new URL(req.url ?? "/", "http://localhost");
      const signature = url.searchParams.get("signature");
      const timestamp = url.searchParams.get("timestamp");
      const nonce = url.searchParams.get("nonce");
      const echostr = url.searchParams.get("echostr");

      // GET = initial verification
      if (req.method === "GET") {
        const ok = verifyWeChatSignature({ token, signature, timestamp, nonce });
        if (!ok) {
          res.statusCode = 401;
          res.end("invalid signature");
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(echostr ?? "");
        return;
      }

      if (req.method !== "POST") {
        res.statusCode = 405;
        res.end("method not allowed");
        return;
      }

      const ok = verifyWeChatSignature({ token, signature, timestamp, nonce });
      if (!ok) {
        res.statusCode = 401;
        res.end("invalid signature");
        return;
      }

      const body = await readBody(req);
      try {
        const parsed = parseXml(body);
        // WeChat wraps in xml: { xml: { ToUserName, FromUserName, MsgType, Content, ... } }
        const msg = parsed?.xml ?? parsed;
        const from = msg?.FromUserName;
        const msgType = msg?.MsgType;
        const content = msg?.Content;
        log(`wechat-mp inbound: type=${msgType} from=${from} content=${content ?? ""}`);
      } catch (e) {
        error(`wechat-mp inbound parse error: ${String(e)}`);
      }

      // Always respond success quickly
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("success");
    },
  });

  log(`wechat-mp: webhook route registered at ${webhookPath}`);

  return await new Promise((resolve) => {
    const done = () => {
      try {
        unregister();
      } catch {
        // ignore
      }
      resolve();
    };
    if (opts.abortSignal?.aborted) return done();
    opts.abortSignal?.addEventListener("abort", done, { once: true });
  });
}
