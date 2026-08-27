"use client";
import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (dateStr: string, selectedDates?: Date[]) => void;
  disabled?: boolean;
  className?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  position?: "auto" | "above" | "below" | "auto left" | "auto right" | "auto center";
}

export default function DatePicker({
  id,
  name,
  label,
  placeholder = "Pilih tanggal",
  value,
  defaultValue,
  onChange,
  disabled = false,
  className = "",
  minDate,
  maxDate,
  position = "auto",
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);

  // Keep ref to latest onChange to prevent stale closure bugs
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      dateFormat: "Y-m-d",
      altInput: false,
      defaultDate: value || defaultValue || undefined,
      minDate,
      maxDate,
      monthSelectorType: "static",
      static: false,
      position: position,
      onChange: (selectedDates, dateStr) => {
        if (onChangeRef.current) {
          onChangeRef.current(dateStr, selectedDates);
        }
      },
    });

    return () => {
      if (fpRef.current) {
        fpRef.current.destroy();
        fpRef.current = null;
      }
    };
  }, [position]);

  // Sync value changes from parent if controlled
  useEffect(() => {
    if (fpRef.current && value !== undefined) {
      const currentVal = fpRef.current.input ? fpRef.current.input.value : "";
      if (value !== currentVal) {
        if (value) {
          fpRef.current.setDate(value, false);
        } else {
          fpRef.current.clear(false);
        }
      }
    }
  }, [value]);

  return (
    <div className="w-full">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          disabled={disabled}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-white text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        />
        <span
          onClick={() => {
            if (fpRef.current) {
              fpRef.current.open();
            }
          }}
          className="absolute text-gray-400 cursor-pointer right-3.5 top-1/2 -translate-y-1/2 dark:text-gray-500 hover:text-brand-500 transition-colors"
        >
          <CalenderIcon className="w-5 h-5" />
        </span>
      </div>
    </div>
  );
}
