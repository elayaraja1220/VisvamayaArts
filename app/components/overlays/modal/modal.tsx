"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "react-feather";

import "../overlays.css";
import type { ModalProps } from "./modal-types";
import Typography from "../../typegrophy/typography";
import Button from "../../button/button";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "medium",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  bodyClassName = "",
  modalClassName=""
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, mounted, closeOnEscape, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section className={`modal modal-${size} ${modalClassName}`.trim()}>
        <header className="modal-header">
          <Typography variant="h4">{title}</Typography>

          {showCloseButton && (
            <Button
              variant="iconOnly"
              type="button"
              color="secondary"
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </Button>
          )}
        </header>

        <div
          className={`modal-body ${bodyClassName}`.trim()}
        >
          {children}
        </div>

        {footer && (
          <footer className="modal-footer">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  );
}
