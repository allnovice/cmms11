"use client";

import { useState } from "react";
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function BorrowForm({ onCancel, onSubmit }: any) {
  const [borrowerName, setBorrowerName] = useState("");
  const [item, setItem] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "borrowRequests"), {
      borrowerName,
      item,
      returnDate,
      purpose,
      createdBy: user.email,
      createdAt: serverTimestamp(),
      status: "Pending",
    });

    setLoading(false);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Borrow Request</h2>

      <label>Borrower Name:</label>
      <input
        type="text"
        value={borrowerName}
        onChange={(e) => setBorrowerName(e.target.value)}
        required
      />

      <label>Item to Borrow:</label>
      <input
        type="text"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        required
      />

      <label>Expected Return Date:</label>
      <input
        type="date"
        value={returnDate}
        onChange={(e) => setReturnDate(e.target.value)}
        required
      />

      <label>Purpose:</label>
      <textarea
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
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
