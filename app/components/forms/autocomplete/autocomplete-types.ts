import type { CSSProperties, ReactNode } from "react";

export type AutocompleteOptionValue = string | number;

export type AutocompleteMatchMode = "contains" | "startsWith";

export type AutocompleteProps<T> = {
  options: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => AutocompleteOptionValue;

  value?:
    | AutocompleteOptionValue
    | AutocompleteOptionValue[]
    | null;

  onChange?: (
    value: AutocompleteOptionValue | AutocompleteOptionValue[] | null,
    option: T | T[] | null
  ) => void;

  inputValue?: string;
  onInputChange?: (value: string) => void;
  filterOptions?: (options: T[], query: string) => T[];

  renderOption?: (
    option: T,
    state: { selected: boolean; active: boolean }
  ) => ReactNode;

  isOptionDisabled?: (option: T) => boolean;

  label?: string;
  placeholder?: string;
  description?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  clearLabel?: string;
  noOptionsMessage?: string;

  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  clearable?: boolean;
  openOnFocus?: boolean;
  minQueryLength?: number;
  maxResults?: number;
  multiple?: boolean;
  /**
   * How typed text matches options (ignored when `filterOptions` is given).
   * - "contains" (default): label contains the text anywhere.
   * - "startsWith": label starts with the text first, then any later word
   *   starting with it ("b" -> Bahamas, Bahrain, ..., Antigua and Barbuda).
   */
  matchMode?: AutocompleteMatchMode;
  /** Shows a dropdown arrow that opens the full (unfiltered) option list. */
  showArrow?: boolean;
  className?: string;
  style?: CSSProperties;
};
