import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "filled" | "outlined" | "ghost" | "report" | "accent" | "dark";
export type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
}

const SIZE_MAP: Record<ButtonSize, { height: number; fontSize: number; px: number }> = {
  sm: { height: 28, fontSize: 13, px: 10 },
  md: { height: 32, fontSize: 14, px: 12 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "filled",
    size = "md",
    leadingIcon,
    trailingIcon,
    loading,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref
) {
  const s = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  const variantClass = {
    filled: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    outlined: "bg-white text-ink border border-gray-150 hover:border-gray-300 shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-50",
    report: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    accent: "bg-yellow-400 text-ink hover:bg-yellow-500",
    dark: "bg-ink text-white hover:bg-gray-900",
  }[variant];

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150",
        variantClass,
        isDisabled && "opacity-50 pointer-events-none",
        className
      )}
      style={{
        height: `${s.height}px`,
        paddingLeft: `${s.px}px`,
        paddingRight: `${s.px}px`,
        fontSize: `${s.fontSize}px`,
        gap: "6px",
        lineHeight: 1.2,
      }}
      {...rest}
    >
      {leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>}
      {children && <span className="whitespace-nowrap">{children}</span>}
      {trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
    </button>
  );
});
