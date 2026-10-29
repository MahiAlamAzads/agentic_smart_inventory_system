import { X } from "lucide-react";
import { useState, type ReactNode } from "react";

const Modal = ({
  title,
  onClose,
  isOpen,
  children,
}: {
  title?: string;
  onClose: () => void;
  isOpen: boolean;
  children: ReactNode;
}) => {

  if(!isOpen)  return;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 cursor-default bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className="relative z-10 w-full max-w-2xl rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b p-4">
          {title && (
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded border p-1"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
