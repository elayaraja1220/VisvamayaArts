
"use client";

import { useId, useState, type KeyboardEvent } from "react";
import type { TabsProps } from "./tabs-types";
import "./tabs.css";

export default function Tabs({
  tabs,
  theme = "primary",
  size = "medium",
  variant = "filled",
  radius = "medium",
  defaultActiveTab,
  activeTab,
  onChange,
  className = "",
  style,
}: TabsProps) {
  const id = useId();

  const firstEnabledTab = tabs.find((tab) => !tab.disabled)?.id ?? "";

  const [internalActiveTab, setInternalActiveTab] = useState(() => {
    const initial = tabs.find(
      (tab) => tab.id === defaultActiveTab && !tab.disabled
    );

    return initial?.id ?? firstEnabledTab;
  });

  const selectedId =
    activeTab !== undefined ? activeTab : internalActiveTab;

  const activeItem = tabs.find(
    (tab) => tab.id === selectedId && !tab.disabled
  );

  const currentId = activeItem?.id ?? firstEnabledTab;

  function selectTab(tabId: string) {
    const tab = tabs.find((item) => item.id === tabId);

    if (!tab || tab.disabled) return;

    if (activeTab === undefined) {
      setInternalActiveTab(tabId);
    }

    onChange?.(tabId);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) {
    const enabledTabs = tabs
      .map((tab, index) => ({ tab, index }))
      .filter(({ tab }) => !tab.disabled);

    const position = enabledTabs.findIndex(
      ({ index }) => index === currentIndex
    );

    if (position < 0 || enabledTabs.length === 0) return;

    let nextPosition: number;

    switch (event.key) {
      case "ArrowRight":
        nextPosition = (position + 1) % enabledTabs.length;
        break;

      case "ArrowLeft":
        nextPosition =
          (position - 1 + enabledTabs.length) % enabledTabs.length;
        break;

      case "Home":
        nextPosition = 0;
        break;

      case "End":
        nextPosition = enabledTabs.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    const nextTab = enabledTabs[nextPosition].tab;

    selectTab(nextTab.id);

    document.getElementById(`${id}-tab-${nextTab.id}`)?.focus();
  }

  return (
    <div
      className={[
        "tabs",
        `tabs-${theme}`,
        `tabs-${size}`,
        `tabs-${variant}`,
        `tabs-radius-${radius}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <div
        className="tabs-list"
        role="tablist"
        aria-label="Product categories"
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === currentId;
          const tabId = `${id}-tab-${tab.id}`;
          const panelId = `${id}-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={[
                "tabs-tab",
                selected ? "tabs-tab-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={tab.disabled}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const selected = tab.id === currentId;

        return (
          <div
            key={tab.id}
            id={`${id}-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${tab.id}`}
            className="tabs-panel"
            hidden={!selected}
            tabIndex={0}
          >
            {selected && tab.content}
          </div>
        );
      })}
    </div>
  );
}