# clawdbot-wechat-mp

WeChat Official Account (公众号) channel plugin for [Clawdbot](https://github.com/clawdbot/clawdbot).

## Status

WIP (initial scaffolding).

## Goals

- Send messages from Clawdbot to a bound owner (or allowlist) on WeChat MP.
- Support:
  - **Customer Service Messages** (48h window)
  - **Subscribe Messages** (requires user subscription)
- Receive inbound messages/events to support binding and pairing.

## Planned Features

- Access token management + refresh
- Signature verification + AES decrypt (optional)
- Owner binding flow via keyword (e.g. `bind`)
- Outbound text/image/file sending

## Development

This repo is intended as a Clawdbot plugin (channel).
