import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import base64url from "base64url";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  // 1. Generate challenge
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  // 2. Save challenge temporarily (could use Redis or in-memory)
  // For serverless, you can encode it in a JWT and send to client

  return NextResponse.json({
    publicKey: {
      challenge: base64url(Buffer.from(challenge)),
      rp: { name: "My App" },
      user: {
        id: userId,
        name: "User",
        displayName: "User"
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      timeout: 60000,
      attestation: "direct"
    }
  });
}
