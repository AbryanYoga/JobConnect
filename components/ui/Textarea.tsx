import React, { forwardRef, useId, useState } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      id,
      required,
      disabled,
      className = "",
      containerClassName = "",
      onChange,
      value,
      defaultValue,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    // State karakter untuk penghitung jika mode uncontrolled
    const [charCount, setCharCount] = useState<number>(() => {
      if (typeof value === "string") return value.length;
      if (typeof defaultValue === "string") return defaultValue.length;
      return 0;
    });

    const currentCount =
      typeof value === "string" ? value.length : charCount;

    const describedBy = error
      ? errorId
      : helperText
      ? helperId
      : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) onChange(e);
    };

    return (
      <div className={`w-full ${containerClassName}`.trim()}>
        <div className="flex items-center justify-between mb-1.5 select-none">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-slate-700"
            >
              {label}
              {required && (
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}

          {showCount && maxLength && (
            <span
              className={`text-xs ${
                currentCount >= maxLength ? "text-red-500 font-medium" : "text-slate-400"
              }`}
            >
              {currentCount}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full min-h-[88px] px-3.5 py-2.5 text-sm bg-white text-slate-900 placeholder:text-slate-400 rounded-control border transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed resize-y ${
            error
              ? "border-red-500 focus-visible:outline-red-600"
              : "border-slate-300 focus-visible:outline-navy-600 hover:border-slate-400"
          } ${className}`.trim()}
          {...props}
        />

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

Textarea.displayName = "Textarea";
