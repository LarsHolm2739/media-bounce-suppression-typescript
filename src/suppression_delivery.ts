import { z } from "zod";
import { infrai } from "./infrai.js";

export const DeliveryRequest = z.object({
  creatorEmail: z.string().email(),
  assetId: z.string().min(1),
  jobId: z.string().min(1),
  title: z.string().min(1),
  downloadText: z.string().min(1)
});
export type DeliveryRequest = z.infer<typeof DeliveryRequest>;
export type DeliveryResult = { status: "suppressed" | "sent"; messageId?: string; assetId: string; jobId: string };

export async function deliverCreatorAsset(input: unknown): Promise<DeliveryResult> {
  const request = DeliveryRequest.parse(input);
  const suppression = await infrai.email.suppression.check(request.creatorEmail);
  if (suppression.suppressed) {
    return { status: "suppressed", assetId: request.assetId, jobId: request.jobId };
  }
  const sent = await infrai.email.send({
    to: request.creatorEmail,
    subject: `Ready: ${request.title}`,
    html: `<p>${request.title} (${request.assetId}) is processed. ${request.downloadText}</p>`
  }, `delivery-${request.jobId}`);
  return { status: "sent", messageId: sent.message_id, assetId: request.assetId, jobId: request.jobId };
}
