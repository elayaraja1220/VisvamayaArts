import type { CSSProperties, ReactNode } from "react";

export type Variant =
  | "filled"
  | "outline"
  | "iconOnly"
  | "transparent"
  | "circle"
  | "bordered";
export type TabsRadius = "none" | "small" | "medium" | "large" | "full";
export type TabTheme =
  | "primary"
  | "secondary"
  | "black"
  | "white";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  /** When set, clicking the tab opens this URL in a new browser tab and also shows the tab's content. */
  href?: string;
};

export type TabSize =
  | "small"
  | "medium"
  | "large"
  | "fullwidth";

export type TabsProps = {
  tabs: TabItem[];
  theme?: TabTheme;
  size?: TabSize;
  variant?: Variant;
  radius?: TabsRadius;
  defaultActiveTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  style?: CSSProperties;
};