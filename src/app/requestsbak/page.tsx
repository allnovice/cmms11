"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "@/firebase";
import { FiHome, FiUsers, FiBox, FiClipboard, FiSettings, FiLogOut, FiPlus } from "react-icons/fi";
import RequestTypeModal from "./RequestTypeModal";
import PurchaseForm from "./PurchaseForm";
import "./RequestsTable.css";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";

interface Request {
  id: string;
  type: string;
  itemName?: string;
  quantity?: number;
  vendor?: string;
  reason?: string;
  status: string;
  createdAt?: any;
}

interface SignatoriesData {
  firstUid?: string;
  secondUid?: string;
  thirdUid?: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formComponent, setFormComponent] = useState<JSX.Element | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);

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

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Request[];
      setRequests(fetchedRequests);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const handleAddRequest = () => setModalOpen(true);

  const handleOpenForm = async (type: string) => {
    setModalOpen(false);

    // Fetch signatories for this request type
    let signatories: SignatoriesData = {};
    try {
      const docRef = doc(db, "settings", "signatories", "requestTypes", type);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) signatories = docSnap.data() as SignatoriesData;
    } catch (err) {
      console.error("Failed to fetch signatories:", err);
    }

    switch (type) {
      case "Purchase":
        setFormComponent(
          <PurchaseForm
            onCancel={() => setFormComponent(null)}
            purchaseData={{ type }}
            signatories={signatories}
          />
        );
        break;
      default:
        setFormComponent(<p>{type} Form Placeholder</p>);
    }
  };

  const handleRowClick = async (req: Request) => {
    // Fetch signatories for this request type
    let signatories: SignatoriesData = {};
    try {
      const docRef = doc(db, "settings", "signatories", "requestTypes", req.type);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) signatories = docSnap.data() as SignatoriesData;
    } catch (err) {
      console.error("Failed to fetch signatories:", err);
    }

    setFormComponent(
      <PurchaseForm
        purchaseData={req}
        signatories={signatories}
        onCancel={() => setFormComponent(null)}
      />
    );
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

      <main className="dashboard-main">
        <div className="requests-header">
          <h2>Requests</h2>
          <button className="add-request-btn" onClick={handleAddRequest}>
            <FiPlus size={24} />
          </button>
        </div>

        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Item Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className="clickable-row"
                  onClick={() => handleRowClick(req)}
                >
                  <td>{req.type}</td>
                  <td>{req.itemName || "-"}</td>
                  <td>{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {formComponent && React.cloneElement(formComponent, { userUid: user.uid })}
      </main>

      <RequestTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onOpenForm={handleOpenForm}
      />
    </div>
  );
}
