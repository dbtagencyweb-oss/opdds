import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = '' }: Props) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl ${className}`}>{children}</div>
  );
}
