"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { FiHome, FiUsers, FiBox, FiSettings, FiLogOut } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
    { icon: <FiSettings size={24} />, path: "/settings" },
    { icon: <FiLogOut size={24} />, action: handleLogout },
  ];

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
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

      {/* Dashboard Content */}
      <main className="dashboard-main">
        <p>Dashboard content goes here.</p>
      </main>
    </div>
  );
}
