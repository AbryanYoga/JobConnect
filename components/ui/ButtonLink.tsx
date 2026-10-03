import React, { forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import {
  ButtonSize,
  ButtonVariant,
  buttonClasses,
} from "./Button";

export interface ButtonLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      href,
      children,
      className = "",
      variant = "primary",
      size = "md",
      fullWidth = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const classes = buttonClasses({ variant, size, fullWidth, className });

    return (
      <Link ref={ref} href={href} className={classes} {...props}>
        {leftIcon && (
          <span className="shrink-0 inline-flex items-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {rightIcon && (
          <span className="shrink-0 inline-flex items-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Link>
    );
  }
);

ButtonLink.displayName = "ButtonLink";
