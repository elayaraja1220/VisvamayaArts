import { ElementType, ReactNode } from "react";
import "./page-section.css";
type PageSectionProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export default function PageSection({
  as: Tag = "section",
  className = "",
  children,
}: PageSectionProps) {
  return <Tag className={`page-section ${className}`}>{children}</Tag>;
}