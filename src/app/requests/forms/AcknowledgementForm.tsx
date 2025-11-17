"use client";

import { useState } from "react";
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AcknowledgementForm({ onCancel, onSubmit }: any) {
  const [recipientName, setRecipientName] = useState("");
  const [item, setItem] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "acknowledgementRequests"), {
      recipientName,
      item,
      remarks,
      createdBy: user.email,
      createdAt: serverTimestamp(),
      status: "Acknowledged",
    });

    setLoading(false);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Acknowledgement Receipt</h2>

      <label>Recipient Name:</label>
      <input
        type="text"
        value={recipientName}
        onChange={(e) => setRecipientName(e.target.value)}
        required
      />

      <label>Item Description:</label>
      <input
        type="text"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        required
      />

      <label>Remarks:</label>
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        rows={3}
      />

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Sign & Submit"}
        </button>
      </div>
    </form>
  );
}
