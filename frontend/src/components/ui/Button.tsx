import { cn } from "@/utils/format";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
  loading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", loading = false, className, children, disabled, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          variant === "secondary" && "btn-secondary",
          variant === "ghost" && "btn-ghost",
          variant === "danger" && "btn-danger",
          size === "sm" && "btn-sm",
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="spinner" aria-hidden="true" /> : null}
        {children}
      </button>
    );
  },
);
