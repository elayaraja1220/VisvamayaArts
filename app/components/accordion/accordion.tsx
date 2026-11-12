"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
} from "react";

import type {
  AccordionProps,
  AccordionHeaderProps,
  AccordionContentProps,
  AccordionItemProps,
} from "./accordion-types";

import "./accordion.css";

type AccordionContextType = {
  baseId: string;
  openIds: string[];
  mode: "single" | "multiple";
  toggleItem: (id: string) => void;
  theme: string;
  size: string;
  contentBackground: string;
};

type ItemContextType = {
  id: string;
  disabled: boolean;
};

const AccordionContext = createContext<AccordionContextType | null>(null);
const AccordionItemContext = createContext<ItemContextType | null>(null);

function useAccordion() {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error("Accordion components must be used inside Accordion.");
  }

  return context;
}

export default function Accordion({
  children,
  theme = "primary",
  size = "medium",
  mode = "single",
  contentBackground = "transparent",
  defaultOpen = false,
  defaultOpenIds,
  className = "",
  style,
  onChange,
}: AccordionProps) {
  const baseId = useId();

  const [openIds, setOpenIds] = useState<string[]>(() => {
    const initial = defaultOpenIds ?? (defaultOpen ? ["default"] : []);
    // single mode can only have one item open
    return mode === "single" ? initial.slice(0, 1) : initial;
  });

  function toggleItem(id: string) {
    const isOpen = openIds.includes(id);

    const nextOpenIds = isOpen
      ? openIds.filter((openId) => openId !== id)
      : mode === "single"
        ? [id]
        : [...openIds, id];

    setOpenIds(nextOpenIds);
    onChange?.(nextOpenIds.includes(id));
  }

  return (
    <AccordionContext.Provider
      value={{
        baseId,
        openIds,
        mode,
        toggleItem,
        theme,
        size,
        contentBackground,
      }}
    >
      <div
        className={[
          "accordion",
          `accordion-${theme}`,
          `accordion-${size}`,
          `accordion-content-${contentBackground}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  id,
  children,
  disabled = false,
  className = "",
}: AccordionItemProps) {
  const { openIds } = useAccordion();
  const isOpen = openIds.includes(id);

  return (
    <AccordionItemContext.Provider value={{ id, disabled }}>
      <div
        className={[
          "accordion-item",
          isOpen ? "accordion-item-open" : "",
          disabled ? "accordion-item-disabled" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionHeader({
  children,
  className = "",
  disabled,
  ...props
}: AccordionHeaderProps) {
  const { baseId, openIds, toggleItem } = useAccordion();
  const item = useContext(AccordionItemContext);

  // "default" supports the single-item JSX shorthand.
  const id = item?.id ?? "default";
  const isDisabled = disabled ?? item?.disabled ?? false;
  const isOpen = openIds.includes(id);

  return (
    <button
      {...props}
      type="button"
      className={["accordion-header", className].filter(Boolean).join(" ")}
     
      disabled={isDisabled}
      onClick={(event) => {
        props.onClick?.(event);

        if (!event.defaultPrevented && !isDisabled) {
          toggleItem(id);
        }
      }}
    >
      <span className="accordion-title">{children}</span>

     
      <svg
        className="accordion-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

export function AccordionContent({
  children,
  className = "",
}: AccordionContentProps) {
  const { baseId, openIds } = useAccordion();
  const item = useContext(AccordionItemContext);

  const id = item?.id ?? "default";
  const isOpen = openIds.includes(id);

  return (
    <div
      id={`${baseId}-content-${id}`}
      className={`accordion-panel ${isOpen ? "accordion-panel-open" : ""}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      {/* animated wrapper: no padding here */}
      <div className="accordion-content">
        {/* padding lives here */}
        <div className={`accordion-content-inner ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
}