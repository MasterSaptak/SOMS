"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Building2, GitBranch, Layers3, Users, Shield, CalendarRange, FileText, Clock, CalendarDays, Briefcase, Tag, Sliders, ChevronLeft } from "lucide-react"

const HR_SETTINGS_CATEGORIES = [
  {
    category: "Organization",
    items: [
      { name: "Company Details", icon: Building2, desc: "Global organizational settings and brand." },
      { name: "Branches", icon: GitBranch, desc: "Manage physical locations and offices." },
      { name: "Departments", icon: Layers3, desc: "Define organizational units." },
      { name: "Teams", icon: Users, desc: "Create and manage work groups." },
    ]
  },
  {
    category: "People",
    items: [
      { name: "Job Titles", icon: Briefcase, desc: "Standardize job titles across the company." },
      { name: "Employment Types", icon: Tag, desc: "Permanent, Contract, Intern, etc." },
      { name: "Custom Fields", icon: Sliders, desc: "Add extra data fields to employee profiles." },
    ]
  },
  {
    category: "Work",
    items: [
      { name: "Leave Types", icon: CalendarRange, desc: "Sick, Casual, Annual leave policies." },
      { name: "Holiday Calendar", icon: CalendarDays, desc: "Company-wide public holidays." },
      { name: "Shifts", icon: Clock, desc: "Working hour configurations." },
      { name: "Work Schedules", icon: CalendarDays, desc: "Assign shifts and working days to employees." },
    ]
  },
  {
    category: "Security",
    items: [
      { name: "Roles & Permissions", icon: Shield, desc: "Configure access control and system roles." },
      { name: "Work Policies", icon: FileText, desc: "Employee handbooks and compliance documents." },
    ]
  }
]

export default function HRSettingsPage() {
  const [activeSection, setActiveSection] = useState("Organization")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/settings" className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HR Configuration</h1>
          <p className="text-sm text-muted-foreground">Manage organizational structure and HR policies.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-6">
          {HR_SETTINGS_CATEGORIES.map((category) => (
            <div key={category.category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                {category.category}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon
                  const active = activeSection === item.name
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveSection(item.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <Icon size={16} />
                      {item.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card border border-border/50 rounded-2xl p-8 min-h-[500px]">
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
            {HR_SETTINGS_CATEGORIES.flatMap(c => c.items).filter(i => i.name === activeSection).map(item => (
              <React.Fragment key={item.name}>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <item.icon size={32} />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{item.name} Configuration</h2>
                <p className="text-muted-foreground mb-6">
                  {item.desc}
                </p>
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 w-full text-sm text-muted-foreground">
                  Configuration screen for {item.name} will be mounted here.
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
