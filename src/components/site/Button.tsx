import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-extrabold whitespace-nowrap transition-opacity outline-none select-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        accent: "bg-accent text-on-accent",
        dark: "bg-ink text-paper",
        outline: "border-2 border-ink bg-transparent text-ink",
        "outline-light": "border-2 border-paper bg-transparent text-paper",
      },
    },
    defaultVariants: {
      variant: "accent",
    },
  }
);

function Button({
  className,
  variant,
  render,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      // Rendering as something other than a <button> (e.g. a Next.js <Link>,
      // for a button-shaped nav item) isn't a native button, so opt out of
      // Base UI's native-button semantics warning in that case.
      nativeButton={render ? false : undefined}
      render={render}
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
