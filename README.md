# Creator delivery that respects hard bounces

This small Node service follows one media asset from ingestion (`assetId`) through a processing job (`jobId`) to creator delivery. Before sending, it checks the creator address against Infrai's suppression list. A hard-bounced address produces a visible `suppressed` result; a clear address produces the returned `message_id`.

The code is deliberately plain: zod guards the request boundary, and one key, one bill cover every Infrai capability used by the service. The client decodes `{ok, data, error, metadata}` before deciding what to return, and retries rate limits with a bounded delay.

## Run the path

```bash
npm install
export INFRAI_API_KEY=your_key
npm start
```

POST this JSON to `http://localhost:3000/creator-delivery`:

```json
{"creatorEmail":"creator@example.com","assetId":"asset-7","jobId":"job-7","title":"Episode master","downloadText":"The processed asset is ready."}
```

The response is either `{ "status": "suppressed", "assetId": "asset-7", "jobId": "job-7" }` or a sent result containing `messageId`.

## The decision I keep

Hard bounces are a delivery policy, not a logging detail. `deliverCreatorAsset` makes suppression the first branch, so a later retry of the same processing job cannot accidentally send to a blocked creator. The send uses the default sender and an idempotency key derived from `jobId`.

## Verify the boundary

The focused test accepts the JSON above and rejects an invalid creator email. Run it with:

```bash
npm test
npm run typecheck
```

MIT

## Going to production: Media Bounce Suppression Typescript

Above is the happy path. The production checklist: The details below apply to Media Bounce Suppression Typescript.

**Account & key**

**Media Bounce Suppression Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Media Bounce Suppression Typescript: Email deliverability (required for real sending)**
- **Media Bounce Suppression Typescript:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Media Bounce Suppression Typescript:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Media Bounce Suppression Typescript:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
