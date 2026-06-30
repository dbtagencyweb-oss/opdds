import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const styles: Record<string, string> = {
  primary: 'bg-[#c8a45d] text-black',
  secondary: 'bg-zinc-900 text-white border border-zinc-700',
  ghost: 'bg-white/5 text-white border border-white/10',
};

export default function Button({ children, className = '', variant = 'primary', type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`opdds-button opdds-button-${variant} inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition duration-200 ${styles[variant] ?? styles.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
