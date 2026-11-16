import React, { forwardRef, useId } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
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
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = error
      ? errorId
      : helperText
      ? helperId
      : undefined;

    return (
      <div className={`w-full ${containerClassName}`.trim()}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5 select-none"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0 inline-flex items-center"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`w-full min-h-[44px] h-11 px-3.5 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 rounded-control border transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed scroll-mt-24 ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-10" : ""} ${
              error
                ? "border-red-500 focus-visible:outline-red-600"
                : "border-slate-300 focus-visible:outline-navy-600 hover:border-slate-400"
            } ${className}`.trim()}
            {...props}
          />

          {rightIcon && (
            <span
              className="absolute right-3.5 text-slate-400 pointer-events-none shrink-0 inline-flex items-center"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
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

Input.displayName = "Input";
