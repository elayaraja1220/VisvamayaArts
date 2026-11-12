
import type { FormChoiceProps } from "../form-types";

export default function FormRadio({
  label,
  error,
  id,
  name,
  value,
  ...props
}: FormChoiceProps) {
  const inputId = id ?? `${name ?? "radio"}-${value ?? "option"}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="form-field">
      <label className="form-choice" htmlFor={inputId}>
        <input
          {...props}
          id={inputId}
          name={name}
          value={value}
          type="radio"
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={error ? errorId : undefined}
        />
        <span>{label}</span>
      </label>

      {error && (
        <span id={errorId} className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
