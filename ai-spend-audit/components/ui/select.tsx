import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

function ChevronDownIcon() {
    return (
        <svg className="h-4 w-4 opacity-50" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function CheckIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4.5 10.5l3.25 3.25L15.5 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(
    function SelectTrigger({ className, children, ...props }, ref) {
        return (
            <SelectPrimitive.Trigger
                ref={ref}
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            >
                {children}
                <SelectPrimitive.Icon asChild>
                    <ChevronDownIcon />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
        )
    }
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(
    function SelectContent({ className, children, position = 'popper', ...props }, ref) {
        return (
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    ref={ref}
                    className={cn(
                        'relative z-50 min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-md',
                        position === 'popper' && 'translate-y-1',
                        className
                    )}
                    position={position}
                    {...props}
                >
                    <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        )
    }
)
SelectContent.displayName = SelectPrimitive.Content.displayName

export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
    function SelectItem({ className, children, ...props }, ref) {
        return (
            <SelectPrimitive.Item
                ref={ref}
                className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    className
                )}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                        <CheckIcon />
                    </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>
        )
    }
)
SelectItem.displayName = SelectPrimitive.Item.displayName
