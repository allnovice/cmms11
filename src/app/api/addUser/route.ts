import { NextResponse } from "next/server";
import { Resend } from "resend";
import admin from "firebase-admin";

// --- Initialize Firebase Admin ---
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// --- Initialize Resend ---
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // --- Create Firebase user (no password) ---
    const userRecord = await admin.auth().createUser({
      email,
      displayName: name || "",
      emailVerified: false,
      disabled: false,
    });

    // --- Generate Firebase password reset link ---
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // --- Send email via Resend ---
    await resend.emails.send({
      from: "Your App <noreply@yourdomain.com>",
      to: email,
      subject: "Welcome to CMMS – Set your password",
      html: `
        <p>Hi ${name || "there"},</p>
        <p>Your CMMS account has been created.</p>
        <p>Click below to set your password and start using the system:</p>
        <p><a href="${resetLink}">Set My Password</a></p>
        <br/>
        <p>If you didn't expect this, you can safely ignore this email.</p>
      `,
    });

    return NextResponse.json({
      message: `User ${email} created and email sent.`,
      uid: userRecord.uid,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
