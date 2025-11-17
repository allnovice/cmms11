"use client";

import { useState } from "react";
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function TransferForm({ onCancel, onSubmit }: any) {
  const [fromDept, setFromDept] = useState("");
  const [toDept, setToDept] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "transferRequests"), {
      fromDept,
      toDept,
      item,
      quantity,
      createdBy: user.email,
      createdAt: serverTimestamp(),
      status: "Pending",
    });

    setLoading(false);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Transfer Request</h2>

      <label>From Department:</label>
      <input
        type="text"
        value={fromDept}
        onChange={(e) => setFromDept(e.target.value)}
        required
      />

      <label>To Department:</label>
      <input
        type="text"
        value={toDept}
        onChange={(e) => setToDept(e.target.value)}
        required
      />

      <label>Item Name:</label>
      <input
        type="text"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        required
      />

      <label>Quantity:</label>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
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
