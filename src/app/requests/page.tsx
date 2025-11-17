"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import {
  FiHome,
  FiUsers,
  FiBox,
  FiClipboard,
  FiSettings,
  FiLogOut,
  FiShoppingCart,
  FiRepeat,
  FiCheckSquare,
  FiDownload,
} from "react-icons/fi";
import FormRenderer from "./FormRenderer";

export default function RequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const navButtons = [
    { icon: <FiHome size={24} />, path: "/" },
    { icon: <FiUsers size={24} />, path: "/users" },
    { icon: <FiBox size={24} />, path: "/assets" },
    { icon: <FiClipboard size={24} />, path: "/requests" },
    { icon: <FiSettings size={24} />, path: "/settings" },
    { icon: <FiLogOut size={24} />, action: handleLogout },
  ];

  const formIcons = [
    { label: "Purchase", icon: <FiShoppingCart size={24} /> },
    { label: "Transfer", icon: <FiRepeat size={24} /> },
    { label: "Acknowledgement", icon: <FiCheckSquare size={24} /> },
    { label: "Borrow", icon: <FiDownload size={24} /> },
  ];

  return (
    <div className="dashboard-container">
      {/* Top Navigation (same as home) */}
      <header className="dashboard-header">
        <div className="nav-items">
          {navButtons.map((btn, idx) => (
            <button
              key={idx}
              className="nav-btn"
              onClick={() => (btn.path ? router.push(btn.path) : btn.action?.())}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </header>

      {/* Requests Page */}
      <main className="dashboard-main" style={{ textAlign: "center" }}>
        {!selectedType ? (
          <div style={{ display: "flex", justifyContent: "center", gap: "60px", marginTop: "60px" }}>
            {formIcons.map((btn) => (
              <div
                key={btn.label}
                onClick={() => setSelectedType(btn.label)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "transform 0.2s",
                }}
              >
                {btn.icon}
                <p style={{ marginTop: "8px" }}>{btn.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <FormRenderer type={selectedType} user={user} onClose={() => setSelectedType(null)} />
        )}
      </main>
    </div>
  );
}
