// /api/passkey/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get("uid");
    if (!uid) return NextResponse.json({ error: "No UID provided" }, { status: 400 });

    const result = await pool.query("SELECT passkey_enabled FROM users WHERE uid = $1", [uid]);
    const enabled = result.rows[0]?.passkey_enabled ?? false;

    return NextResponse.json({ enabled });
  } catch (err) {
    console.error("Passkey status error:", err);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
