import React from 'react'

export default function OrganizationChartPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v7" />
          <path d="M12 11h9" />
          <path d="M12 11H3" />
          <path d="M3 11v4" />
          <path d="M21 11v4" />
          <path d="M12 18v3" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="0" y="15" width="6" height="6" rx="1" />
          <rect x="18" y="15" width="6" height="6" rx="1" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-3">Organization Chart</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        The interactive visualization of your enterprise structure is coming in Sprint 6.
      </p>
    </div>
  )
}
