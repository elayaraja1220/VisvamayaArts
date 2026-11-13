"use client";

import { useEffect } from "react";
import "./confirmation-dialog.css";
import Button from "../../button/button";

export type ConfirmationStatus =
  | "success"
  | "failed"
  | "inprogress"
  | "warning"
  | "info";

export type ConfirmationDialogProps = {
  open: boolean;
  status: ConfirmationStatus;

  title?: string;
  description?: string;

  primaryActionLabel?: string;
  secondaryActionLabel?: string;

  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onClose?: () => void;

  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;

  autoClose?: boolean;
  autoCloseDuration?: number;
};

const STATUS_CONFIG = {
  success: {
    icon: "✓",
    defaultTitle: "Success!",
    defaultDescription: "Your request was completed successfully.",
  },

  failed: {
    icon: "✕",
    defaultTitle: "Something went wrong",
    defaultDescription: "Unable to complete your request. Please try again.",
  },

  inprogress: {
    icon: "",
    defaultTitle: "Please wait...",
    defaultDescription: "Your request is being processed.",
  },

  warning: {
    icon: "!",
    defaultTitle: "Action Required",
    defaultDescription: "Please review the information before continuing.",
  },

  info: {
    icon: "i",
    defaultTitle: "Information",
    defaultDescription: "Please review the information below.",
  },
};

export default function ConfirmationDialog({
  open,
  status,
  title,
  description,

  primaryActionLabel,
  secondaryActionLabel,

  onPrimaryAction,
  onSecondaryAction,
  onClose,

  showCloseButton = true,
  closeOnBackdrop = false,

  autoClose = false,
  autoCloseDuration = 5000,
}: ConfirmationDialogProps) {
  const config = STATUS_CONFIG[status];

  useEffect(() => {
    if (!open || !autoClose || status === "inprogress") {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose?.();
    }, autoCloseDuration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, autoClose, autoCloseDuration, status, onClose]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showCloseButton) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, showCloseButton, onClose]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose?.();
    }
  };

  return (
    <div
      className="confirmation-dialog-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        className={`confirmation-dialog confirmation-dialog--${status}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        onClick={(event) => event.stopPropagation()}
      >
        {showCloseButton && (
          <Button
            type="button"
            className="confirmation-dialog__close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            &times;
          </Button>
        )}

        <div
          className={`confirmation-dialog__icon confirmation-dialog__icon--${status}`}
          aria-hidden="true"
        >
          {status === "inprogress" ? (
            <span className="confirmation-dialog__spinner" />
          ) : (
            config.icon
          )}
        </div>

        <h2
          id="confirmation-dialog-title"
          className="confirmation-dialog__title"
        >
          {title ?? config.defaultTitle}
        </h2>

        <p
          id="confirmation-dialog-description"
          className="confirmation-dialog__description"
          aria-live="polite"
        >
          {description ?? config.defaultDescription}
        </p>

        {(primaryActionLabel || secondaryActionLabel) && (
          <div className="confirmation-dialog__actions">

            {secondaryActionLabel && (
              <Button
                type="button"
                variant="outline"
                curve="full"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            )}

            {primaryActionLabel && (
              <Button
                type="button"
                color="secondary"
                curve="full"
                onClick={onPrimaryAction}
              >
                {primaryActionLabel}
              </Button>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
