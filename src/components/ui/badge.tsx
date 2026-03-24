import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]",
      positive: "bg-[#e7f6ef] text-[#116149]",
      caution: "bg-[#fff3e1] text-[#8b5e00]",
      danger: "bg-[#fdebec] text-[#a33c43]",
      neutral: "bg-black/5 text-[color:var(--muted-foreground)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}


