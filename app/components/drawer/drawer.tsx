
"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import "./drawer.css";
import Typography from "../typegrophy/typography";

export type DrawerTheme = "primary" | "secondary";
export type DrawerSize = "small" | "medium" | "large" | "full";
export type DrawerPosition = "left" | "right" | "top" | "bottom";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;

  theme?: DrawerTheme;
  size?: DrawerSize;
  backdrop?: boolean;
  position?: DrawerPosition;

  header?: ReactNode;
  footer?: ReactNode;

  headerTheme?: DrawerTheme;
  footerTheme?: DrawerTheme;

  headerColor?: string;
  footerColor?: string;
  contentBackgroundColor?: string;
  contentTextColor?: string;
  contentPadding?: string;

  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
};

type DrawerStyle = CSSProperties & {
  "--drawer-size"?: string;
  "--drawer-header-bg"?: string;
  "--drawer-footer-bg"?: string;
  "--drawer-content-bg"?: string;
  "--drawer-content-color"?: string;
  "--drawer-content-padding"?: string;
};

const ANIMATION_MS = 300;

const themeColors: Record<DrawerTheme, string> = {
  primary: "#2563eb",
  secondary: "#4b5563",
};

const sizeValues: Record<DrawerSize, string> = {
  small: "320px",
  medium: "420px",
  large: "580px",
  full: "100%",
};

export default function Drawer({
  open,
  onClose,
  children,

  theme,
  size,
  backdrop = true,
  position = "right",

  header,
  footer,

  headerTheme,
  footerTheme,

  headerColor,
  footerColor,
  contentBackgroundColor,
  contentTextColor,
  contentPadding,

  closeOnBackdrop = true,
  closeOnEscape = true,
  className = "",
}: DrawerProps) {
  const panelRef = useRef<HTMLElement>(null);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  // Client-side mounting.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render the drawer when opened.
  useEffect(() => {
    if (mounted && open) {
      setVisible(true);
    }
  }, [mounted, open]);

  // Opening animation.
  useEffect(() => {
    if (!open || !visible) return;

    let raf2 = 0;

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setActive(true);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, visible]);

  // Closing animation.
  useEffect(() => {
    if (!mounted || open) return;

    setActive(false);

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, ANIMATION_MS);

    return () => window.clearTimeout(timer);
  }, [mounted, open]);

  // Escape key and body scroll handling.
  useEffect(() => {
    if (!mounted || !open) return;

    const previousOverflow = document.body.style.overflow;

    if (backdrop) {
      document.body.style.overflow = "hidden";
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, open, backdrop, closeOnEscape, onClose]);

  // Focus management.
  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    panelRef.current?.focus({ preventScroll: true });

    return () => {
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [active]);

  // Apply only the supplied size and color/content props.
  const styles: DrawerStyle = {
    ...(size !== undefined && {
      "--drawer-size": sizeValues[size],
    }),

    ...(headerColor !== undefined
      ? { "--drawer-header-bg": headerColor }
      : headerTheme !== undefined
        ? { "--drawer-header-bg": themeColors[headerTheme] }
        : theme !== undefined
          ? { "--drawer-header-bg": themeColors[theme] }
          : {}),

    ...(footerColor !== undefined
      ? { "--drawer-footer-bg": footerColor }
      : footerTheme !== undefined
        ? { "--drawer-footer-bg": themeColors[footerTheme] }
        : theme !== undefined
          ? { "--drawer-footer-bg": themeColors[theme] }
          : {}),

    ...(contentBackgroundColor !== undefined && {
      "--drawer-content-bg": contentBackgroundColor,
    }),

    ...(contentTextColor !== undefined && {
      "--drawer-content-color": contentTextColor,
    }),

    ...(contentPadding !== undefined && {
      "--drawer-content-padding": contentPadding,
    }),
  };

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className={`drawer-root ${active ? "is-open" : "is-closing"} position`}
      data-position={position}
      data-backdrop={backdrop}
    >
      {backdrop && (
        <button
          type="button"
          className="drawer-backdrop"
          tabIndex={-1}
          aria-label="Close drawer backdrop"
          onClick={() => {
            if (closeOnBackdrop) {
              onClose();
            }
          }}
        />
      )}

      <section
        ref={panelRef}
        tabIndex={-1}
        className={`drawer-panel ${className}`.trim()}
        style={styles}
        data-size={size ?? "medium"}
        data-theme={theme ?? "primary"}
        role="dialog"
        aria-modal={backdrop ? true : undefined}
        inert={!open}
      >
        <header className="drawer-header">
          <Typography variant="h4" className="drawer-header-title">{header}</Typography>

          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        <div className="drawer-content">{children}</div>

        {footer != null && (
          <footer className="drawer-footer">{footer}</footer>
        )}
      </section>
    </div>,
    document.body
  );
}
