import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = '', variant = 'primary', ...props }, ref) => {
  let baseClasses = "flex-1 bg-transparent border-none text-[15px] text-[#f3f3f6] light:text-[#18181f] px-4 py-3 sm:py-2 outline-none w-full placeholder:text-[#6b6b78] light:placeholder:text-[#82828e]";

  if (variant === 'secondary') {
    baseClasses = "flex-1 px-4 py-3.5 bg-[#1a1a1f] light:bg-white text-white light:text-[#18181f] text-[16px] sm:text-[15px] rounded-xl border border-[#2a2a2f] light:border-[#d9d9e3] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition shadow-inner min-w-0 w-full";
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
