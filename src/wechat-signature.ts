import crypto from "node:crypto";

export function verifyWeChatSignature(params: {
  token: string;
  signature: string | null;
  timestamp: string | null;
  nonce: string | null;
}): boolean {
  const { token, signature, timestamp, nonce } = params;
  if (!token || !signature || !timestamp || !nonce) return false;
  const arr = [token, timestamp, nonce].map(String).sort();
  const sha1 = crypto.createHash("sha1").update(arr.join(""), "utf8").digest("hex");
  return sha1 === signature;
}
