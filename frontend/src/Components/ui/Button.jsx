import React from 'react';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, danger, success
  className = '',
  style = {},
  disabled,
  ...props
}) => {
  let baseClasses = "flex shrink-0 items-center justify-center gap-2 px-6 py-3 min-h-[44px] w-full sm:w-auto rounded font-sans font-semibold text-[15px] transition-transform duration-150 hover:-translate-y-px active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";
  let colorClasses = "";
  
  if (variant === 'primary') {
    colorClasses = "bg-[var(--prl-accent-fill)] text-[var(--prl-on-accent)] hover:brightness-105";
  } else if (variant === 'secondary') {
    colorClasses = "bg-[var(--prl-surface-2)] text-[var(--prl-text)] hover:bg-[var(--prl-border)]";
  } else if (variant === 'ghost') {
    colorClasses = "bg-transparent text-[var(--prl-text)] hover:bg-[var(--prl-surface-2)]";
  } else if (variant === 'danger') {
    colorClasses = "bg-red-600 text-white hover:bg-red-500";
  } else if (variant === 'success') {
    colorClasses = "bg-emerald-600 text-white hover:bg-emerald-500";
  }

  return (
    <button
      className={`${baseClasses} ${colorClasses} ${className}`}
      style={style}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
