# clawdbot-wechat-mp

WeChat Official Account (公众号) channel plugin for [Clawdbot](https://github.com/clawdbot/clawdbot).

## Status

WIP (MVP in progress).

Current scope:
- Webhook route for WeChat server verification + inbound logging
- Outbound **Customer Service Message** text sending (48h window)

## Install

```bash
clawdbot plugins install <npm-package>
```

(For now, this repo is a dev target; packaging/publishing will be added.)

## Configuration

### Clawdbot config example

```yaml
channels:
  wechat-mp:
    enabled: true
    appId: "wx..."
    appSecret: "..."
    # WeChat server token (公众号后台「服务器配置」)
    token: "..."
    # Optional (only if you enable message encryption)
    encodingAESKey: "..."

    # Where WeChat calls into the Gateway plugin HTTP server
    webhookPath: "/wechat-mp/events"

    # Default recipient if message.target is omitted
    ownerOpenId: "oXXXX..."

    # outboundMode: customerService (MVP) | subscribe (future)
    outboundMode: "customerService"

    # accountType: service | subscribe (for docs/assumptions)
    accountType: "service"
```

### WeChat MP server configuration

In the WeChat Official Account admin:

- **URL**: `https://<your-public-gateway-host><webhookPath>`
  - example: `https://example.com/wechat-mp/events`
- **Token**: must match `channels.wechat-mp.token`
- **EncodingAESKey**: optional; matches `channels.wechat-mp.encodingAESKey`

The plugin supports the initial **GET verification** request (echo `echostr`).

## Notes / Limitations

- Customer Service Messages are only deliverable within WeChat's 48-hour window.
- Subscribe Message support will be added later and requires explicit user subscription authorization.
