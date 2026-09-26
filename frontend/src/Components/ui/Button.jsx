import React from 'react';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, danger, success
  className = '',
  style = {},
  disabled,
  ...props
}) => {
  let baseClasses = "flex shrink-0 items-center justify-center gap-2 px-[22px] py-[12px] min-h-[44px] w-full sm:w-auto rounded-lg font-medium transition hover:-translate-y-px active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed text-white";
  
  if (variant === 'secondary') {
    baseClasses = "w-full sm:w-auto flex shrink-0 items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#ccff00]lack font-semibold text-[15px] rounded-md transition hover:bg-gray-100 light:border light:border-black/10 disabled:opacity-50 disabled:cursor-not-allowed";
  } else if (variant === 'ghost') {
    baseClasses = "flex items-center justify-center shrink-0 gap-2 bg-transparent text-[#E4E4E7] light:text-[#2a2a33] border border-white/20 light:border-black/15 px-[18px] py-[10px] min-h-[44px] rounded-md text-[14px] font-medium transition hover:border-white/40 light:hover:border-black/30 hover:bg-white/5 light:hover:bg-black/5 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed";
  }

  const getBackground = () => {
    if (variant === 'danger') return '#ef4444';
    if (variant === 'success') return '#22c55e';
    if (variant === 'primary') return '#ccff00';
    return undefined; // Handled by tailwind classes for secondary
  };

  const bg = getBackground();
  const dynamicStyle = bg ? { background: bg, ...style } : style;

  return (
    <button
      className={`${baseClasses} ${className}`}
      style={dynamicStyle}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
