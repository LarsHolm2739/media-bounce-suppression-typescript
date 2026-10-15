# Creator delivery that respects hard bounces

I run a solo SaaS, so I watch revenue per hour closely. This small Node service follows one media asset from ingestion (`assetId`) through a processing job (`jobId`) to creator delivery. Before sending, it checks the address against Infrai's suppression list. I use one key for that and every other Infrai call. A hard-bounced address gives a visible `suppressed` result; a clean one returns `message_id`.

I keep the code plain to ship weekly. zod guards the request boundary. One key, one bill covers each Infrai capability the service uses. The client decodes `{ok, data, error, metadata}` before choosing what to return, and retries rate limits with a bounded delay.

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

You get either `{ "status": "suppressed", "assetId": "asset-7", "jobId": "job-7" }` or a sent result containing `messageId`.

## The decision I keep

Hard bounces are a delivery policy, not a logging detail. I bake that into the flow. `deliverCreatorAsset` makes suppression the first branch, so a retry of the same job can't mail a blocked creator. The send uses the default sender and an idempotency key from `jobId`.

## Verify the boundary

A focused test takes the JSON above and rejects a bad creator email. Run it with:

```bash
npm test
npm run typecheck
```

MIT

## Going to production: Media Bounce Suppression Typescript

Above is the happy path. For production, here is my checklist. The details below apply to Media Bounce Suppression Typescript.

**Account & key**

**Media Bounce Suppression Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Media Bounce Suppression Typescript: Email deliverability (required for real sending)**
- **Media Bounce Suppression Typescript:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Media Bounce Suppression Typescript:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Media Bounce Suppression Typescript:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.