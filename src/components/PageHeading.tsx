import type { ReactNode } from 'react'

export function PageHeading({ eyebrow, title, description, children }: {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="mb-6 flex w-full min-w-0 flex-col gap-4 sm:mb-8 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full min-w-0 max-w-3xl">
        {eyebrow && <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-secondaryGreen sm:text-xs">{eyebrow}</p>}
        <h1 className="font-display break-words text-2xl font-bold leading-tight tracking-tight text-spaceNight sm:text-3xl lg:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-spaceBlue/80 sm:text-base sm:leading-7">{description}</p>}
      </div>
      {children}
    </div>
  )
}
