"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { FiHome, FiUsers, FiBox, FiClipboard, FiSettings, FiLogOut } from "react-icons/fi";
import ChatBox from "./ChatBox";

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Check auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
      } else {
        setUser(currentUser);

        // Fetch users after login
        try {
          const usersCol = collection(db, "users");
          const usersSnapshot = await getDocs(usersCol);
          const usersList = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(usersList);
        } catch (err) {
          console.error("Error fetching users:", err);
        } finally {
          setUsersLoading(false);
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
              onClick={() => (btn.path ? router.push(btn.path) : btn.action?.())}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard-main">
        <h1>Users</h1>

        {usersLoading ? (
          <p>Loading users...</p>
        ) : (
          <>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Division</th>
                    <th>Employee ID</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.role}</td>
                      <td>{u.division}</td>
                      <td>{u.employeeId}</td>
                      <td>{u.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ChatBox at the bottom */}
            <div style={{ marginTop: "30px" }}>
              <ChatBox userName={user.email?.split("@")[0]} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
