"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createOrUpdateUserProfile } from "@/utils/firebaseHelpers";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect to home
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await createOrUpdateUserProfile({ uid: user.uid, email: user.email });

      // Ensure user doc exists
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, { uid: user.uid, email: user.email, createdAt: new Date().toISOString() });
      }

      router.replace("/");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Passkey login
  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // This is placeholder for your passkey login logic
      // Typically, you call the WebAuthn API or your backend endpoint
      const success = await window.navigator.credentials.get({
        publicKey: {/* passkey options from backend */},
      });

      if (success) {
        // Example: match user UID returned from passkey
        const userUid = success.id; // adjust based on your setup
        const userRef = doc(db, "users", userUid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          router.replace("/");
        } else {
          setError("Passkey exists but user not found.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Passkey login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <h1>Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Passkey login button: always visible */}
        <button
          className="login-btn passkey-btn"
          type="button"
          onClick={handlePasskeyLogin}
          disabled={loading}
          style={{ marginTop: 10 }}
        >
          {loading ? "Processing..." : "Login with Passkey 🔑"}
        </button>

        {error && <p style={{ color: "crimson", marginTop: 8 }}>{error}</p>}
      </form>
    </div>
  );
}
