import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

function Tooltip({ children, ...props }) {
  return <TooltipPrimitive.Tooltip {...props}>{children}</TooltipPrimitive.Tooltip>;
}

function TooltipProvider({ children, ...props }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200} {...props}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = ({ className, sideOffset = 4, ...props }) => (
  <TooltipPrimitive.Content
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-white px-3 py-2 text-sm text-gray-900 shadow-md",
      "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in data-[state=closed]:fade-out",
      className
    )}
    {...props}
  />
);

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
