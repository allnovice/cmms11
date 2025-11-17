// RequestTypeModal.tsx
"use client";

import { FC } from "react";
import { FiShoppingCart, FiRepeat, FiCheckSquare, FiDownload } from "react-icons/fi";
import PurchaseForm from "./PurchaseForm"; // <-- import here if you want to open directly

interface RequestTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenForm: (form: JSX.Element) => void; // pass the form to parent
}

const RequestTypeModal: FC<RequestTypeModalProps> = ({ isOpen, onClose, onOpenForm }) => {
  if (!isOpen) return null;

  const types = [
    { label: "Purchase", icon: <FiShoppingCart size={20} />, form: <PurchaseForm onCancel={onClose} onSubmit={() => onClose()} /> },
    { label: "Transfer", icon: <FiRepeat size={20} />, form: <p>Transfer Form Placeholder</p> },
    { label: "Acknowledgement", icon: <FiCheckSquare size={20} />, form: <p>Acknowledgement Form Placeholder</p> },
    { label: "Borrow", icon: <FiDownload size={20} />, form: <p>Borrow Form Placeholder</p> },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Select Request Type</h3>
        <div className="request-type-grid">
          {types.map((t) => (
            <button
              key={t.label}
              className="request-type-btn"
              onClick={() => {
                onOpenForm(t.label); // <-- pass the form to parent
                onClose(); // close modal
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <button className="modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default RequestTypeModal;
