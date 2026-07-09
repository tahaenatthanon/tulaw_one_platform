import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[--radius-btn] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tu-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-tu-primary text-tu-text-inverse hover:bg-tu-primary-hover active:bg-tu-primary-active",
        secondary: "bg-tu-secondary text-tu-text-primary hover:bg-tu-secondary-hover active:bg-tu-secondary-active",
        outline: "border border-tu-border bg-transparent text-tu-text-primary hover:bg-tu-surface-hover",
        ghost: "text-tu-text-secondary hover:bg-tu-surface-hover hover:text-tu-text-primary",
        destructive: "bg-tu-error text-white hover:bg-tu-error/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
