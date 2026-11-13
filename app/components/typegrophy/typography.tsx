import { ElementType, ReactNode } from "react";
import "./typography.css";

type Variant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "small" | "caption";

type TypographyProps = {
  variant?: Variant;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  dangerouslySetInnerHTML?: { __html: string };
};

const defaultTag: Record<Variant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  small: "p",
  caption: "span",
};

export default function Typography({
  variant = "body",
  as,
  className = "",
  children,
  dangerouslySetInnerHTML,
}: TypographyProps) {
  const Tag = as || defaultTag[variant];

  return (
    <Tag 
      className={`typography typography-${variant} ${className}`.trim()}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </Tag>
  );
}