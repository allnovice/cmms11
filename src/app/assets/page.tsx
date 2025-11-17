"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { FiHome, FiUsers, FiBox, FiClipboard,  FiSettings, FiLogOut } from "react-icons/fi";

export default function AssetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

  // Check auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
      } else {
        setUser(currentUser);

        // Fetch assets after login
        try {
          const assetsCol = collection(db, "assets");
          const assetsSnapshot = await getDocs(assetsCol);
          const assetsList = assetsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAssets(assetsList);
        } catch (err) {
          console.error("Error fetching assets:", err);
        } finally {
          setAssetsLoading(false);
        }
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

return (
  <div className="dashboard-container">
    {/* Top Navigation */}
    <header className="dashboard-header">
      <div className="nav-items">
        {navButtons.map((btn, idx) => (
          <button
            key={idx}
            className="nav-btn"
            onClick={() => (btn.path ? router.push(btn.path) : btn.action && btn.action())}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </header>

    {/* Dashboard Content */}
    <main className="dashboard-main">
      <h1>Assets</h1>

      {assetsLoading ? (
        <p>Loading assets...</p>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Asset ID</th>
                <th>Category</th>
                <th>Location</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id}>
                  <td>{a.assetName}</td>
                  <td>{a.assetId}</td>
                  <td>{a.category}</td>
                  <td>{a.location}</td>
                  <td>{a.assignedTo}</td>
                  <td>{a.status}</td>
                  <td>
                    {a.createdAt
                      ? new Date(a.createdAt.seconds * 1000).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  </div>
);
}
