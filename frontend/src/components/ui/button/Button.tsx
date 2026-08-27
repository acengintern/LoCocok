import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "xs" | "sm" | "md" | "lg"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Additional classes
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => {
  // Size Classes aligned to 4px/8px scale
  const sizeClasses = {
    xs: "h-7.5 px-2.5 text-theme-xs font-medium gap-1.5",
    sm: "h-8 px-3 text-theme-xs font-medium gap-1.5",
    md: "h-9 px-3.5 text-theme-xs font-semibold gap-2",
    lg: "h-10 px-4 text-theme-sm font-medium gap-2",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300 dark:disabled:bg-brand-800/50",
    outline:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04] dark:hover:text-white shadow-theme-xs",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
