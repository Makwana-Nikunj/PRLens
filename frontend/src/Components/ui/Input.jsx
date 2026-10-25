import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = '', variant = 'primary', ...props }, ref) => {
  let baseClasses = "flex-1 bg-transparent border-none text-[15px] text-[var(--prl-text)] px-4 py-3 sm:py-2 outline-none w-full placeholder:text-[var(--prl-text-dim)]";

  if (variant === 'secondary') {
    baseClasses = "flex-1 px-4 py-3.5 bg-[var(--prl-bg-soft)] text-[var(--prl-text)] text-[16px] sm:text-[15px] rounded-md border border-[var(--prl-border)] focus:outline-none focus:border-[var(--prl-accent)] transition min-w-0 w-full placeholder:text-[var(--prl-text-dim)]";
  }

  return (
    <input
      ref={ref}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
export default Input;
