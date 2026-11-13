"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";
import { ButtonLink } from "./ButtonLink";
import { useLanguage } from "@/lib/i18n";

export type EmptyStateLinkAction = {
  label: string;
  href: string;
};

export type EmptyStateClickAction = {
  label: string;
  onClick: () => void;
};

export type EmptyStateAction = EmptyStateLinkAction | EmptyStateClickAction;

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  headingLevel?: "h2" | "h3";
  className?: string;
}

function renderAction(
  actionItem: EmptyStateAction,
  variant: "primary" | "outline",
  t: (id: string, en?: string) => string
) {
  if ("href" in actionItem) {
    return (
      <ButtonLink
        href={actionItem.href}
        variant={variant}
        size="md"
        className="w-full sm:w-auto"
      >
        {t(actionItem.label)}
      </ButtonLink>
    );
  }

  return (
    <Button
      onClick={actionItem.onClick}
      variant={variant}
      size="md"
      className="w-full sm:w-auto"
    >
      {t(actionItem.label)}
    </Button>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  headingLevel = "h3",
  className = "",
}: EmptyStateProps) {
  const { t } = useLanguage();
  const Heading = headingLevel;

  return (
    <div
      className={`py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto rounded-card border border-dashed border-slate-300 bg-white/50 ${className}`.trim()}
    >
      <div
        className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-4 shrink-0"
        aria-hidden="true"
      >
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>

      <Heading className="text-base font-semibold text-slate-900 mb-1 tracking-tight">
        {t(title)}
      </Heading>

      {description && (
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t(description)}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {renderAction(action, "primary", t)}
        {secondaryAction && renderAction(secondaryAction, "outline", t)}
      </div>
    </div>
  );
}
