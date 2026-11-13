"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import type {
  AutocompleteOptionValue,
  AutocompleteProps,
} from "./autocomplete-types";

import "./autocomplete.css";

export default function Autocomplete<T>({
  options,
  getOptionLabel,
  getOptionValue,
  value,
  onChange,
  inputValue,
  onInputChange,
  filterOptions,
  renderOption,
  isOptionDisabled,
  label,
  placeholder = "Search...",
  description,
  emptyMessage = "No results found.",
  loadingMessage = "Loading...",
  clearLabel = "Clear selection",
  noOptionsMessage = "No options available.",
  name,
  id,
  disabled = false,
  required = false,
  loading = false,
  clearable = true,
  openOnFocus = true,
  minQueryLength = 1,
  maxResults = 100,
  multiple = false,
  showArrow = false,
  matchMode = "contains",
  className = "",
  style,
}: AutocompleteProps<T>) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = id ?? `autocomplete-${generatedId}`;
  const labelId = `${inputId}-label`;
  const descriptionId = `${inputId}-description`;
  const listboxId = `${inputId}-listbox`;
  const statusId = `${inputId}-status`;

  const isInputControlled = inputValue !== undefined;
  const isSelectionControlled = value !== undefined;

  const [internalInputValue, setInternalInputValue] = useState("");
  const [internalValue, setInternalValue] = useState<
    AutocompleteOptionValue | AutocompleteOptionValue[] | null
  >(value ?? (multiple ? [] : null));

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // True when opened from the arrow: list every option, ignore the query.
  const [showAll, setShowAll] = useState(false);

  const query = isInputControlled ? inputValue : internalInputValue;
  const selectedValue = isSelectionControlled ? value : internalValue;

  const selectedValues = useMemo(() => {
    if (selectedValue == null) return [];
    return Array.isArray(selectedValue) ? selectedValue : [selectedValue];
  }, [selectedValue]);

  const selectedOptions = useMemo(
    () =>
      options.filter((option) =>
        selectedValues.some(
          (selected) =>
            String(selected) === String(getOptionValue(option))
        )
      ),
    [options, selectedValues, getOptionValue]
  );

  const defaultFilter = useCallback(
    (items: T[], search: string) => {
      const normalizedQuery = search.trim().toLocaleLowerCase();

      if (!normalizedQuery) return items;

      if (matchMode === "startsWith") {
        const starts: T[] = [];
        const wordStarts: T[] = [];

        for (const option of items) {
          const optionLabel = getOptionLabel(option).toLocaleLowerCase();

          if (optionLabel.startsWith(normalizedQuery)) {
            starts.push(option);
          } else if (
            optionLabel
              .split(/[\s\-(),.]+/)
              .some((word) => word.startsWith(normalizedQuery))
          ) {
            wordStarts.push(option);
          }
        }

        return [...starts, ...wordStarts];
      }

      return items.filter((option) =>
        getOptionLabel(option)
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      );
    },
    [getOptionLabel, matchMode]
  );

  const filteredOptions = useMemo(() => {
  const searchQuery = query.trim();

  if (showAll) {
    return options.slice(0, Math.max(0, maxResults));
  }

  if (searchQuery.length < minQueryLength) {
    return [];
  }

  const filtered = filterOptions
    ? filterOptions(options, searchQuery)
    : defaultFilter(options, searchQuery);

  return filtered.slice(0, Math.max(0, maxResults));
}, [
  options,
  query,
  showAll,
  filterOptions,
  defaultFilter,
  maxResults,
  minQueryLength,
]);

  const enabledOptions = useMemo(
    () =>
      filteredOptions
        .map((option, index) => ({ option, index }))
        .filter(({ option }) => !isOptionDisabled?.(option)),
    [filteredOptions, isOptionDisabled]
  );

  const activeOption =
    activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;

  const activeOptionId =
    activeOption && !isOptionDisabled?.(activeOption)
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  const shouldShowOptions =
    isOpen && (showAll || query.trim().length >= minQueryLength);

  const setQuery = useCallback(
    (nextValue: string) => {
      if (!isInputControlled) {
        setInternalInputValue(nextValue);
      }

      onInputChange?.(nextValue);
      setActiveIndex(-1);
    },
    [isInputControlled, onInputChange]
  );

  const emitSelection = useCallback(
    (
      nextValues: AutocompleteOptionValue[],
      nextOptions: T[]
    ) => {
      const nextValue = multiple
        ? nextValues
        : (nextValues[0] ?? null);

      const nextOption = multiple
        ? nextOptions
        : (nextOptions[0] ?? null);

      if (!isSelectionControlled) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue, nextOption);
    },
    [multiple, isSelectionControlled, onChange]
  );

  const selectOption = useCallback(
    (option: T) => {
      if (disabled || isOptionDisabled?.(option)) return;

      const optionValue = getOptionValue(option);

      if (multiple) {
        const alreadySelected = selectedValues.some(
          (selected) => String(selected) === String(optionValue)
        );

        const nextOptions = alreadySelected
          ? selectedOptions.filter(
              (item) =>
                String(getOptionValue(item)) !== String(optionValue)
            )
          : [...selectedOptions, option];

        const nextValues = nextOptions.map(getOptionValue);

        emitSelection(nextValues, nextOptions);
        setQuery("");
        setIsOpen(true);
        setActiveIndex(-1);
        inputRef.current?.focus();
        return;
      }

      emitSelection([optionValue], [option]);
      setQuery(getOptionLabel(option));
      setShowAll(false);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [
      disabled,
      isOptionDisabled,
      getOptionValue,
      getOptionLabel,
      multiple,
      selectedValues,
      selectedOptions,
      emitSelection,
      setQuery,
    ]
  );

  const removeOption = useCallback(
    (option: T) => {
      if (disabled) return;

      const optionValue = getOptionValue(option);

      const nextOptions = selectedOptions.filter(
        (item) =>
          String(getOptionValue(item)) !== String(optionValue)
      );

      emitSelection(
        nextOptions.map(getOptionValue),
        nextOptions
      );
      inputRef.current?.focus();
    },
    [disabled, getOptionValue, selectedOptions, emitSelection]
  );

  const clearSelection = useCallback(() => {
    if (disabled) return;

    emitSelection([], []);
    setQuery("");
    setActiveIndex(-1);
    setIsOpen(true);
    inputRef.current?.focus();
  }, [disabled, emitSelection, setQuery]);

  const moveActiveOption = useCallback(
    (direction: 1 | -1) => {
      if (enabledOptions.length === 0) {
        setActiveIndex(-1);
        return;
      }

      const currentPosition = enabledOptions.findIndex(
        ({ index }) => index === activeIndex
      );

      const nextPosition =
        currentPosition === -1
          ? direction === 1
            ? 0
            : enabledOptions.length - 1
          : (currentPosition + direction + enabledOptions.length) %
            enabledOptions.length;

      setActiveIndex(enabledOptions[nextPosition].index);
      setIsOpen(true);
    },
    [enabledOptions, activeIndex]
  );

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setShowAll(false);
    setIsOpen(true);
  }

  function toggleFromArrow() {
    if (disabled) return;

    if (isOpen) {
      setIsOpen(false);
      setShowAll(false);
      setActiveIndex(-1);
      return;
    }

    setShowAll(true);
    setIsOpen(true);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setIsOpen(true);
        moveActiveOption(1);
        break;

      case "ArrowUp":
        event.preventDefault();
        setIsOpen(true);
        moveActiveOption(-1);
        break;

      case "Enter":
        if (
          shouldShowOptions &&
          activeOption &&
          !isOptionDisabled?.(activeOption)
        ) {
          event.preventDefault();
          selectOption(activeOption);
        }
        break;

      case "Escape":
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
        }
        break;

      case "Backspace":
        if (
          multiple &&
          !query &&
          selectedOptions.length > 0
        ) {
          removeOption(selectedOptions[selectedOptions.length - 1]);
        }
        break;

      case "Tab":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setShowAll(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!activeOptionId || !isOpen) return;

    document
      .getElementById(activeOptionId)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId, isOpen]);

  const statusMessage = loading
    ? loadingMessage
    : options.length === 0
      ? noOptionsMessage
      : filteredOptions.length === 0
        ? emptyMessage
        : `${filteredOptions.length} ${
            filteredOptions.length === 1 ? "result" : "results"
          } available.`;

  return (
    <div
      ref={rootRef}
      className={["autocomplete", className].filter(Boolean).join(" ")}
      style={style}
    >
      {label && (
        <label
          id={labelId}
          htmlFor={inputId}
          className="autocomplete-label"
        >
          {label}
          {required && (
            <span className="autocomplete-required" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
      )}

      {description && (
        <p id={descriptionId} className="autocomplete-description">
          {description}
        </p>
      )}

      <div
        className={[
          "autocomplete-control",
          isOpen ? "autocomplete-control-open" : "",
          disabled ? "autocomplete-control-disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {multiple &&
          selectedOptions.map((option) => (
            <span
              key={String(getOptionValue(option))}
              className="autocomplete-chip"
            >
              <span className="autocomplete-chip-label">
                {getOptionLabel(option)}
              </span>

              <button
                type="button"
                className="autocomplete-chip-remove"
                aria-label={`Remove ${getOptionLabel(option)}`}
                disabled={disabled}
                onClick={() => removeOption(option)}
              >
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
                  <path
                    d="m5 5 10 10M15 5 5 15"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          ))}

        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          role="combobox"
          value={query}
          placeholder={
            multiple && selectedOptions.length > 0
              ? "Add another..."
              : placeholder
          }
          disabled={disabled}
          required={required && selectedOptions.length === 0}
          autoComplete="off"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={shouldShowOptions}
          aria-controls={listboxId}
          aria-activedescendant={
            shouldShowOptions ? activeOptionId : undefined
          }
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          onChange={handleInputChange}
          onFocus={() => {
            if (openOnFocus && !disabled && query.trim().length >= minQueryLength) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="autocomplete-input"
        />

        {loading && (
          <span className="autocomplete-spinner" aria-hidden="true" />
        )}

        {!loading && clearable && !disabled &&
          (query || selectedOptions.length > 0) && (
            <button
              type="button"
              className="autocomplete-clear"
              aria-label={clearLabel}
              onClick={clearSelection}
            >
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                <path
                  d="m5 5 10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

        {showArrow && (
          <button
            type="button"
            className={[
              "autocomplete-arrow",
              isOpen ? "autocomplete-arrow-open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={isOpen ? "Close options" : "Show all options"}
            tabIndex={-1}
            disabled={disabled}
            onPointerDown={(event) => event.preventDefault()}
            onClick={toggleFromArrow}
          >
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <div id={statusId} className="autocomplete-sr-only" role="status">
        {shouldShowOptions ? statusMessage : ""}
      </div>

      {shouldShowOptions && (
        <div className="autocomplete-popup">
          <ul
            id={listboxId}
            className="autocomplete-listbox"
            role="listbox"
            aria-labelledby={label ? labelId : undefined}
            aria-multiselectable={multiple || undefined}
            aria-busy={loading}
          >
            {loading ? (
              <li className="autocomplete-message" role="presentation">
                {loadingMessage}
              </li>
            ) : options.length === 0 ? (
              <li className="autocomplete-message" role="presentation">
                {noOptionsMessage}
              </li>
            ) : filteredOptions.length === 0 ? (
              <li className="autocomplete-message" role="presentation">
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = getOptionValue(option);
                const selected = selectedValues.some(
                  (item) => String(item) === String(optionValue)
                );
                const active = index === activeIndex;
                const optionDisabled = Boolean(isOptionDisabled?.(option));

                return (
                  <li
                    key={String(optionValue)}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={selected}
                    aria-disabled={optionDisabled || undefined}
                    className={[
                      "autocomplete-option",
                      active ? "autocomplete-option-active" : "",
                      selected ? "autocomplete-option-selected" : "",
                      optionDisabled ? "autocomplete-option-disabled" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onPointerMove={() => {
                      if (!optionDisabled) setActiveIndex(index);
                    }}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => selectOption(option)}
                  >
                    <span className="autocomplete-option-content">
                      {renderOption
                        ? renderOption(option, { selected, active })
                        : getOptionLabel(option)}
                    </span>

                    {selected && (
                      <span className="autocomplete-option-check" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
