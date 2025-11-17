import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await pool.connect();
    const res = await client.query(
      "SELECT passkey_enabled FROM users WHERE uid = $1 LIMIT 1",
      [uid]
    );
    client.release();

    const enabled = res.rows[0]?.passkey_enabled ?? false;

    return NextResponse.json({ enabled });
  } catch (err) {
    console.error("Passkey status error:", err);
    return NextResponse.json({ error: "Failed to get passkey status" }, { status: 500 });
  }
}
