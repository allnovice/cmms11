import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export async function POST(req: NextRequest) {
  try {
    const { uid, enable } = await req.json();
    if (!uid || typeof enable !== "boolean") {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const client = await pool.connect();
    await client.query(
      "UPDATE users SET passkey_enabled = $1 WHERE uid = $2",
      [enable, uid]
    );
    client.release();

    return NextResponse.json({ enabled: enable });
  } catch (err) {
    console.error("Passkey toggle error:", err);
    return NextResponse.json({ error: "Failed to update passkey" }, { status: 500 });
  }
}
