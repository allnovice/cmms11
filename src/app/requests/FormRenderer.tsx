"use client";

import { FC, useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import PurchaseForm from "./forms/PurchaseForm";
import TransferForm from "./forms/TransferForm";
import AcknowledgementForm from "./forms/AcknowledgementForm";
import BorrowForm from "./forms/BorrowForm";

interface Props {
  type: string;
  user: any;
  onClose: () => void;
}

interface SignatoriesData {
  firstUid?: string;
  secondUid?: string;
  thirdUid?: string;
}

const FormRenderer: FC<Props> = ({ type, user, onClose }) => {
  const [signatories, setSignatories] = useState<SignatoriesData>();
  const [allowedToSign, setAllowedToSign] = useState(false);

  // Fetch signatories from Firestore
  useEffect(() => {
    const fetchSignatories = async () => {
      try {
        const docRef = doc(db, "settings", "signatories", "requestTypes", type);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as SignatoriesData;
          setSignatories(data);

          // Check if current user can sign
          const canSign =
            user.uid === data.firstUid ||
            user.uid === data.secondUid ||
            user.uid === data.thirdUid;
          setAllowedToSign(canSign);
        }
      } catch (err) {
        console.error("Failed to load signatories:", err);
      }
    };
    fetchSignatories();
  }, [type, user]);

  // Restrict signing
  const handleSign = async (requestId: string) => {
    if (!allowedToSign) {
      alert("You are not authorized to sign this document.");
      return;
    }

    try {
      const reqRef = doc(db, "requests", requestId);
      await updateDoc(reqRef, {
        signedBy: user.uid,
        signedAt: new Date().toISOString(),
      });
      alert("Signed successfully!");
    } catch (err) {
      console.error("Error signing request:", err);
      alert("Failed to sign.");
    }
  };

  // Render the correct form
  const renderForm = () => {
    const commonProps = {
      onCancel: onClose,
      onSign: handleSign,
      canSign: allowedToSign,
    };

    switch (type) {
      case "Purchase":
        return <PurchaseForm {...commonProps} />;
      case "Transfer":
        return <TransferForm {...commonProps} />;
      case "Acknowledgement":
        return <AcknowledgementForm {...commonProps} />;
      case "Borrow":
        return <BorrowForm {...commonProps} />;
      default:
        return <p>Unknown form type</p>;
    }
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>{type} Request Form</h3>
      {renderForm()}
      <button onClick={onClose} style={{ marginTop: "20px" }}>
        Back
      </button>
    </div>
  );
};

export default FormRenderer;
