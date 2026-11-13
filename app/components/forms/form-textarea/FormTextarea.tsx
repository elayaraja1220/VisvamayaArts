import type { FormTextareaProps } from "../form-types";
import { getFormClasses } from "../form-utils";

export default function FormTextarea({
  variant = "filled",
  size = "medium",
  curve = "medium",
  label,
  error,
  className,
  id,
  name,
  required,
  "aria-describedby": describedBy,
  ...props
}: FormTextareaProps) {
  const textareaId = id ?? name;
  const errorId = textareaId
    ? `${textareaId}-error`
    : undefined;

  const ariaDescribedBy = [
    describedBy,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={textareaId}>
          {label}
          {required && (
            <span className="form-required" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
      )}

      <textarea
        {...props}
        id={textareaId}
        name={name}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={ariaDescribedBy}
        className={getFormClasses({
          variant,
          size,
          curve,
          className: `form-textarea ${className ?? ""}`,
        })}
      />

      {error && (
        <span id={errorId} className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
