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