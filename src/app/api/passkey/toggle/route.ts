// /api/passkey/toggle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { uid, enable } = await req.json();
    if (!uid) return NextResponse.json({ error: "No UID provided" }, { status: 400 });

    await pool.query("UPDATE users SET passkey_enabled = $1 WHERE uid = $2", [enable, uid]);

    return NextResponse.json({ enabled: enable });
  } catch (err) {
    console.error("Passkey toggle error:", err);
    return NextResponse.json({ error: "Failed to toggle passkey" }, { status: 500 });
  }
}
