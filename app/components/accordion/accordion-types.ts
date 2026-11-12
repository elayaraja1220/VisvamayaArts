import type {
  CSSProperties,
  ReactNode,
  ButtonHTMLAttributes,
} from "react";

export type AccordionTheme =
  | "primary"
  | "secondary"
  | "default"
  | "light";

export type AccordionSize = "small" | "medium" | "large";

export type AccordionMode = "single" | "multiple";

export type AccordionContentBackground =
  | "transparent"
  | "default"
  | "cream";

export interface AccordionProps {
  children: ReactNode;
  theme?: AccordionTheme;
  size?: AccordionSize;
  mode?: AccordionMode;
  contentBackground?: AccordionContentBackground;
  defaultOpen?: boolean;
  defaultOpenIds?: string[];
  className?: string;
  style?: CSSProperties;
  onChange?: (isOpen: boolean) => void;
}

export interface AccordionHeaderProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  disabled?: boolean;
}

export interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

export interface AccordionItemProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}