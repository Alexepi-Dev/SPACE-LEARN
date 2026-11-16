import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size]

  const variantStyles = {
    primary: 'bg-spaceTurquoise text-white hover:bg-teal-600 focus-visible:outline-spaceTurquoise shadow-sm',
    secondary: 'bg-sunAmber text-spaceNight hover:bg-amber-400 focus-visible:outline-sunAmber font-semibold',
    outline: 'border border-slate-300 bg-transparent text-spaceNight hover:bg-slate-100 dark:border-slate-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  }[variant]

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
