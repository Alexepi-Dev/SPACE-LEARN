import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md ${className}`}
      {...props}
    >
      {title && <h3 className="text-base font-semibold text-spaceNight">{title}</h3>}
      {description && <p className="mt-1 text-xs text-slate-600">{description}</p>}
      <div className={title || description ? 'mt-4' : ''}>{children}</div>
    </div>
  )
}
