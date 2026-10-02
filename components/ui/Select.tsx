import React, { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      children,
      id,
      required,
      disabled,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const describedBy = error
      ? errorId
      : helperText
      ? helperId
      : undefined;

    return (
      <div className={`w-full ${containerClassName}`.trim()}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 mb-1.5 select-none"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`w-full min-h-[44px] h-11 pl-3.5 pr-10 py-2 text-sm bg-white text-slate-900 rounded-control border appearance-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer ${
              error
                ? "border-red-500 focus-visible:outline-red-600"
                : "border-slate-300 focus-visible:outline-navy-600 hover:border-slate-400"
            } ${className}`.trim()}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <span
            className="absolute right-3.5 text-slate-400 pointer-events-none shrink-0 inline-flex items-center"
            aria-hidden="true"
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-red-600 mt-1.5 font-medium"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-slate-500 mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
