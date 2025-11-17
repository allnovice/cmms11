"use client";

import { FC, useEffect, useState } from "react";
import { db, auth } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Props {
  onCancel: () => void;
  purchaseData?: any;
  signatories?: SignatoriesData;
}

interface SignatoriesData {
  firstUid?: string;
  secondUid?: string;
  thirdUid?: string;
}

const PurchaseForm: FC<Props> = ({ onCancel, purchaseData, signatories = {} }) => {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [level2Name, setLevel2Name] = useState<string>("");
  const [level3Name, setLevel3Name] = useState<string>("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUserUid(currentUser?.uid || null);
    });
    return () => unsub();
  }, []);

  // Fetch usernames for display
  useEffect(() => {
    const fetchNames = async () => {
      if (signatories.secondUid) {
        const u2 = await getDoc(doc(db, "users", signatories.secondUid));
        if (u2.exists()) setLevel2Name(u2.data().username);
      }
      if (signatories.thirdUid) {
        const u3 = await getDoc(doc(db, "users", signatories.thirdUid));
        if (u3.exists()) setLevel3Name(u3.data().username);
      }
    };
    fetchNames();
  }, [signatories]);

  const handleSign = async (level: string) => {
    alert(`Signed as ${level}`);
    // Optional: save signature confirmation to Firestore here
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget) as any);

    try {
      await addDoc(collection(db, "requests"), {
        type: "Purchase",
        ...formData,
        signaturesData: {
          requester: userUid === signatories.firstUid ? "Signed" : null,
          level2: null,
          level3: null,
        },
        signatories: {
          level1: signatories.firstUid || "All Users",
          level2: signatories.secondUid || null,
          level3: signatories.thirdUid || null,
        },
        status: "Pending",
        createdAt: serverTimestamp(),
      });
      alert("Request submitted!");
      onCancel();
    } catch (err) {
      console.error("Error saving request:", err);
      alert("Failed to submit request.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="document-form">
      <h3>Purchase Request</h3>

      <label>Item Name:</label>
      <input
        name="itemName"
        defaultValue={purchaseData?.itemName || ""}
        required
      />

      <label>Quantity:</label>
      <input
        name="quantity"
        type="number"
        defaultValue={purchaseData?.quantity || ""}
        required
      />

      <label>Vendor:</label>
      <input name="vendor" defaultValue={purchaseData?.vendor || ""} />

      <label>Reason:</label>
      <textarea name="reason" defaultValue={purchaseData?.reason || ""} />

      {/* Requester sign */}
      <div className="signature-section">
        <label>Requester Signature:</label>
        <button
          type="button"
          disabled={userUid !== signatories.firstUid}
          onClick={() => handleSign("Requester")}
          style={{
            backgroundColor:
              userUid === signatories.firstUid ? "#007bff" : "#ccc",
            color: "white",
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {userUid === signatories.firstUid ? "Sign" : "Sign (Locked)"}
        </button>
      </div>

      {/* Level 2 sign */}
      {signatories.secondUid && (
        <div className="signature-section">
          <label>Level 2 Signature: {level2Name || "Loading..."}</label>
          <button
            type="button"
            disabled={userUid !== signatories.secondUid}
            onClick={() => handleSign("Level 2")}
            style={{
              backgroundColor:
                userUid === signatories.secondUid ? "#007bff" : "#ccc",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {userUid === signatories.secondUid ? "Sign" : "Sign (Locked)"}
          </button>
        </div>
      )}

      {/* Level 3 sign */}
      {signatories.thirdUid && (
        <div className="signature-section">
          <label>Level 3 Signature: {level3Name || "Loading..."}</label>
          <button
            type="button"
            disabled={userUid !== signatories.thirdUid}
            onClick={() => handleSign("Level 3")}
            style={{
              backgroundColor:
                userUid === signatories.thirdUid ? "#007bff" : "#ccc",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {userUid === signatories.thirdUid ? "Sign" : "Sign (Locked)"}
          </button>
        </div>
      )}

      <button type="submit">Submit</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
};

export default PurchaseForm;
