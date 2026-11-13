import type { FormChoiceProps } from "../form-types";

export default function FormCheckbox({
  label,
  error,
  id,
  name,
  ...props
}: FormChoiceProps) {
  const inputId = id ?? name;
  const errorId = inputId ? `${inputId}-error` : undefined;

  return (
    <div className="form-field">
      <label className="form-choice" htmlFor={inputId}>
        <input
          {...props}
          id={inputId}
          name={name}
          type="checkbox"
        
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
