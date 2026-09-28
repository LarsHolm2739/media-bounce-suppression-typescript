import { createServer } from "node:http";
import { deliverCreatorAsset } from "./suppression_delivery.js";

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/creator-delivery") { res.writeHead(404); res.end(); return; }
  try {
    const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const result = await deliverCreatorAsset(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(result));
  } catch (error) {
    const status = error instanceof SyntaxError || error instanceof Error && error.name === "ZodError" ? 400 : 502;
    res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: error instanceof Error ? error.message : "request failed" }));
  }
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("creator delivery listening"));
