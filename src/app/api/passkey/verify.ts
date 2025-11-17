export async function POST(req: NextRequest) {
  const { userId, credentialId, publicKey, signCount } = await req.json();

  // Convert base64 to Buffer if needed
  const credentialIdBuf = Buffer.from(credentialId, "base64");
  const publicKeyBuf = Buffer.from(publicKey, "base64");

  const query = `
    UPDATE users
    SET passkey_credential_id = $1,
        passkey_public_key = $2,
        passkey_sign_count = $3
    WHERE id = $4
  `;

  await pool.query(query, [credentialIdBuf, publicKeyBuf, signCount, userId]);

  return NextResponse.json({ success: true });
}
