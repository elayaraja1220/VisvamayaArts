"use client";

import "./loading.css";

type LoadingProps = {
  type?: "section" | "page";
  message?: string;
  className?: string;
};

export default function Loading({
  type = "section",
  message = "Loading...",
  className = "",
}: LoadingProps) {
  return (
    <div
      className={`loading-container loading-${type} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="loading-spinner" aria-hidden="true" />
      <span className="loading-message">{message}</span>
    </div>
  );
}