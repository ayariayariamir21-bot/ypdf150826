import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '../lib/utils';

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {}

export const Toggle = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, ToggleProps>(
  function Toggle({ className, ...props }, ref) {
    return (
      <SwitchPrimitive.Root
        ref={ref}
        className={cn(
          'focus-visible:ring-brand-500 data-[state=checked]:bg-brand-600 dark:data-[state=checked]:bg-brand-500 peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-slate-200 dark:focus-visible:ring-offset-slate-950 dark:data-[state=unchecked]:bg-slate-700',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb className="pointer-events-none block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
      </SwitchPrimitive.Root>
    );
  }
);
Toggle.displayName = 'Toggle';

export interface ToggleFieldProps extends ToggleProps {
  label: string;
  description?: string;
  id: string;
}

export function ToggleField({
  label,
  description,
  id,
  className,
  disabled,
  ...props
}: ToggleFieldProps): React.ReactElement {
  return (
    <div className={cn('flex w-full items-center justify-between gap-4', className)}>
      <div className="space-y-1">
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium leading-none text-slate-900 dark:text-slate-100',
            disabled && 'opacity-70'
          )}
        >
          {label}
        </label>
        {description ? (
          <p className={cn('text-xs text-slate-500 dark:text-slate-400', disabled && 'opacity-70')}>
            {description}
          </p>
        ) : null}
      </div>
      <Toggle id={id} disabled={disabled} {...props} />
    </div>
  );
}
