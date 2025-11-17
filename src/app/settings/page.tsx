"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
      } else {
        setUser(currentUser);
        await fetchPasskeyStatus(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchPasskeyStatus = async (uid: string) => {
    try {
      const res = await fetch(`/api/passkey/status?uid=${uid}`);
      if (!res.ok) throw new Error("Failed to fetch passkey status");
      const data = await res.json();
      setPasskeyEnabled(data.enabled);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasskeyToggle = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/passkey/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, enable: !passkeyEnabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle passkey");
      const data = await res.json();
      setPasskeyEnabled(data.enabled);
      alert(data.enabled ? "Passkey enabled" : "Passkey disabled");
    } catch (err) {
      console.error(err);
      alert("Failed to toggle passkey");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <button onClick={handleLogout}>Logout</button>
      </header>

      <main className="dashboard-main">
        <h2>Settings</h2>

        <section style={{ marginTop: 20 }}>
          <h3>Passkey Authentication</h3>
          <button onClick={handlePasskeyToggle}>
            {passkeyEnabled ? "Passkey Enabled" : "Enable Passkey"}
          </button>
        </section>
      </main>
    </div>
  );
}
