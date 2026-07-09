import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-tu-primary text-white",
        secondary: "border-transparent bg-tu-secondary-soft text-tu-secondary-active",
        success: "border-transparent bg-tu-success/10 text-tu-success",
        warning: "border-transparent bg-tu-warning/10 text-tu-warning",
        destructive: "border-transparent bg-tu-error/10 text-tu-error",
        info: "border-transparent bg-tu-info/10 text-tu-info",
        outline: "border-tu-border text-tu-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
