"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export function Select({ value, onChange, options, placeholder = "선택..." }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || highlightIndex < 0 || !listRef.current) return;
    const items = listRef.current.children;
    if (items[highlightIndex]) {
      (items[highlightIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
          setHighlightIndex(options.findIndex((o) => o.value === value));
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((prev) => Math.min(prev + 1, options.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightIndex >= 0 && highlightIndex < options.length) {
            onChange(options[highlightIndex].value);
            setOpen(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [open, highlightIndex, options, value, onChange]
  );

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setHighlightIndex(options.findIndex((o) => o.value === value));
        }}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "7px 10px",
          borderRadius: 8,
          border: open ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--color-border)",
          background: "var(--color-surface-hover)",
          color: selectedLabel ? "var(--color-text-primary)" : "var(--color-text-muted)",
          fontSize: 11,
          fontWeight: 500,
          fontFamily: "inherit",
          cursor: "pointer",
          outline: "none",
          textAlign: "left",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: open ? "0 0 0 2px rgba(59,130,246,0.08)" : "none",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={12}
          style={{
            flexShrink: 0,
            color: "var(--color-text-muted)",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            borderRadius: 10,
            border: "1px solid var(--color-border-hover)",
            background: "var(--color-bg-secondary)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            boxShadow:
              "0 12px 40px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.1), inset 0 1px 0 var(--color-border)",
            overflow: "hidden",
            animation: "selectDropIn 0.15s ease-out",
          }}
        >
          <div
            ref={listRef}
            role="listbox"
            style={{
              maxHeight: 200,
              overflowY: "auto",
              padding: 4,
            }}
          >
            {options.map((option, idx) => {
              const isSelected = option.value === value;
              const isHighlighted = idx === highlightIndex;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: isHighlighted
                      ? "rgba(59,130,246,0.12)"
                      : "transparent",
                    color: isSelected ? "#60a5fa" : "var(--color-text-primary)",
                    fontSize: 11,
                    fontWeight: isSelected ? 600 : 400,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    outline: "none",
                    textAlign: "left",
                    transition: "background 0.1s",
                  }}
                >
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check
                      size={11}
                      style={{ flexShrink: 0, color: "#3b82f6" }}
                    />
                  )}
                </button>
              );
            })}

            {options.length === 0 && (
              <div
                style={{
                  padding: "12px 10px",
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                옵션 없음
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
