import type {
  CSSProperties,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";

export type FormVariant = "filled" | "outline";
export type FormSize = "small" | "medium" | "large";
export type FormCurve = "small" | "medium" | "large";

export type FormColor =
  | "white"
  | "primary"
  | "secondary"
  | "success"
  | "danger";

export type FormStyleProps = {
  variant?: FormVariant;
  size?: FormSize;
  curve?: FormCurve;
  className?: string;
  style?: CSSProperties;
};

export type FormInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> &
  FormStyleProps & {
    label?: string;
    error?: string;
  };

export type FormTextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement> &
  FormStyleProps & {
    label?: string;
    error?: string;
  };

export type FormSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> &
  FormStyleProps & {
    label?: string;
    error?: string;
    options: { label: string; value: string }[];
    placeholder?: string;
    color?: FormColor;
  };

export type FormButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "size"
> &
  FormStyleProps;

export type FormChoiceProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  label: string;
  error?: string;
};
