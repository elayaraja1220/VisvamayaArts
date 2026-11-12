
import type { HTMLAttributes } from "react";
import "./card.css";

export type CardPadding = "xs" | "medium" | "large";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: CardPadding;
};

export function Card({
  padding = "medium",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card card-padding-${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  padding,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card-header ${padding ? `card-padding-${padding}` : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  padding,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card-body ${padding ? `card-padding-${padding}` : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  padding,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card-footer ${padding ? `card-padding-${padding}` : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
