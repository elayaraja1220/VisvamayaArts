
import type {
  FormCurve,
  FormSize,
  FormVariant,
} from "./form-types";

type FormClassOptions = {
  variant?: FormVariant;
  size?: FormSize;
  curve?: FormCurve;
  className?: string;
};

export function getFormClasses({
  variant = "filled",
  size = "medium",
  curve = "medium",
  className = "",
}: FormClassOptions = {}): string {
  return [
    "form-control",
    `form-control--${variant}`,
    `form-control--${size}`,
    `form-control--curve-${curve}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getButtonClasses({
  variant = "filled",
  size = "medium",
  curve = "medium",
  className = "",
}: FormClassOptions = {}): string {
  return [
    "form-button",
    `form-button--${variant}`,
    `form-control--${size}`,
    `form-control--curve-${curve}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
