"use client";

import { useState } from "react";
import { db, auth } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function PurchaseForm() {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("You must be logged in to submit.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "purchases"), {
        itemName,
        quantity,
        unitCost,
        supplier,
        remarks,
        createdBy: user.email,
        createdAt: serverTimestamp(),
      });

      setMessage("Form submitted successfully!");
      setItemName("");
      setQuantity("");
      setUnitCost("");
      setSupplier("");
      setRemarks("");
    } catch (error) {
      console.error(error);
      setMessage("Error submitting form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Purchase Form</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Unit Cost"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          required
        />
        <textarea
          placeholder="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Sign"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <style jsx>{`
        .form-container {
          max-width: 400px;
          margin: 30px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 12px;
          background: #f9f9f9;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        input,
        textarea {
          padding: 10px;
          border: 1px solid #aaa;
          border-radius: 6px;
        }
        button {
          padding: 10px;
          background: black;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
        }
        .message {
          margin-top: 10px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
