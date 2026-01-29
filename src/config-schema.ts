import { z } from "zod";

export { z };

export const WechatMpConfigSchema = z
  .object({
    enabled: z.boolean().optional(),
    appId: z.string().optional(),
    appSecret: z.string().optional(),
    token: z.string().optional(),
    encodingAESKey: z.string().optional(),
    accountType: z.enum(["service", "subscribe"]).optional().default("service"),
    webhookPath: z.string().optional().default("/wechat-mp/events"),
    ownerOpenId: z.string().optional(),
    outboundMode: z.enum(["customerService", "subscribe"]).optional().default("customerService"),
    dmPolicy: z.enum(["pairing", "open", "allowlist"]).optional().default("pairing"),
    allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
  })
  .strict();
