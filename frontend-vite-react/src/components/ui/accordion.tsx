import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
))
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-b border-white/5", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { isOpen?: boolean; onClick?: () => void }
>(({ className, children, isOpen, onClick, ...props }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className={cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-primary-foreground",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown
      className={cn(
        "h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground",
        isOpen && "rotate-180"
      )}
    />
  </button>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isOpen?: boolean }
>(({ className, children, isOpen, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all duration-300 ease-in-out",
      isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
    )}
    {...props}
  >
    <div className={cn("pb-4 pt-0 text-muted-foreground", className)}>{children}</div>
  </div>
))
AccordionContent.displayName = "AccordionContent"

// Simple controlled wrapper for ease of use
export function SimpleAccordion({ 
  items 
}: { 
  items: { title: string; content: React.ReactNode }[] 
}) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <Accordion>
      {items.map((item, index) => (
        <AccordionItem key={index} className="border-white/10">
          <AccordionTrigger 
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="text-white hover:text-blue-400"
          >
            {item.title}
          </AccordionTrigger>
          <AccordionContent isOpen={openIndex === index} className="text-gray-400">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
