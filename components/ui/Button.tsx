import React, { forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: ButtonClassOptions = {}): string {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-control transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-navy-700 text-white hover:bg-navy-800 active:bg-navy-900 shadow-xs",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-navy-700 hover:border-slate-400 active:bg-slate-100",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-navy-700 active:bg-slate-200",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs focus-visible:outline-red-600",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "min-h-[44px] px-3.5 py-1.5 text-xs gap-1.5",
    md: "min-h-[44px] px-4 py-2.5 text-sm gap-2",
    lg: "min-h-[48px] px-5 py-3 text-base gap-2.5",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim();
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const classes = buttonClasses({ variant, size, fullWidth, className });

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? "true" : undefined}
        className={classes}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4 shrink-0 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && (
          <span className="shrink-0 inline-flex items-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 inline-flex items-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
