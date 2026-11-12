
import type { FormSelectProps } from "../form-types";
import { getFormClasses } from "../form-utils";

export default function FormSelect({
  variant = "filled",
  color = "white",
  size = "medium",
  curve = "medium",
  label,
  error,
  options,
  placeholder = "Select an option",
  className,
  id,
  name,
  required,
  "aria-describedby": describedBy,
  ...props
}: FormSelectProps) {
  const selectId = id ?? name;
  const errorId = selectId ? `${selectId}-error` : undefined;

  const ariaDescribedBy = [
    describedBy,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="form-field form-select-wrapper">
       <span className="form-select-arrow" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <select
        {...props}
        id={selectId}
        name={name}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={ariaDescribedBy}
        className={getFormClasses({
          variant,
          size,
          curve,
          className: [
            "form-select",
            `form-select--${color}`,
            className,
          ]
            .filter(Boolean)
            .join(" "),
        })}
      >
        {
          placeholder && <option value="">{placeholder}</option>
        }
        

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

     
    </div>
  );
}
