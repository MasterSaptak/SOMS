"use client"

import React from 'react'
import EmployeeProfilePage from '@/app/employee/[id]/page'

export default function AdminEmployeeProfilePage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-lg p-3 mb-6 flex items-center justify-center text-sm font-medium">
        You are viewing this profile as an HR Administrator.
      </div>
      <EmployeeProfilePage />
    </div>
  )
}
