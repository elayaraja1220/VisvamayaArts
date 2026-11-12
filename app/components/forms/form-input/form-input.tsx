
import type { FormInputProps } from "../form-types";
import { getFormClasses } from "../form-utils";

export default function FormInput({
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
}: FormInputProps) {
  const inputId = id ?? name;
  const errorId = inputId ? `${inputId}-error` : undefined;

  const ariaDescribedBy = [
    describedBy,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
          {required && (
            <>
              {" "}
              <span className="form-required" aria-hidden="true">
                *
              </span>
            </>
          )}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        name={name}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={ariaDescribedBy}
        className={getFormClasses({
          variant,
          size,
          curve,
          className: `form-input ${className ?? ""}`,
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
