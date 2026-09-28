import assert from "node:assert/strict";
import { DeliveryRequest } from "./suppression_delivery.js";

const parsed = DeliveryRequest.parse({ creatorEmail: "creator@example.com", assetId: "asset-7", jobId: "job-7", title: "Episode master", downloadText: "The processed asset is ready." });
assert.equal(parsed.jobId, "job-7");
assert.throws(() => DeliveryRequest.parse({ creatorEmail: "bad", assetId: "asset-7", jobId: "job-7", title: "x", downloadText: "y" }));
console.log("request boundary: valid creator delivery accepted; invalid email rejected");
